/* eslint-disable array-callback-return */
import { CharacterBuff, ICharacterBuff } from "@entities/ModuleCharacter/CharacterBuffModel";
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterPvPKillLog } from "@entities/ModuleCharacter/CharacterPvPKillLogModel";
import { Equipment, IEquipment } from "@entities/ModuleCharacter/EquipmentModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { DROP_EQUIPMENT_CHANCE } from "@providers/constants/DeathConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { DiscordBot } from "@providers/discord/DiscordBot";
import { EquipmentSlotTypes, EquipmentSlots } from "@providers/equipment/EquipmentSlots";
import { blueprintManager, entityEffectUse, equipmentSlots } from "@providers/inversify/container";
import { ItemOwnership } from "@providers/item/ItemOwnership";
import {
  AccessoriesBlueprint,
  BodiesBlueprint,
  ContainersBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { Locker } from "@providers/locks/Locker";
import { NPCTarget } from "@providers/npc/movement/NPCTarget";
import { SkillDecrease } from "@providers/skill/SkillDecrease";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import {
  BattleSocketEvents,
  CharacterBuffType,
  CharacterSkullType,
  EntityType,
  IBattleDeath,
  IEquipmentAndInventoryUpdatePayload,
  IUIShowMessage,
  ItemSocketEvents,
  Modes,
  NPCCustomDeathPenalties,
  UISocketEvents,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import _ from "lodash";
import { Types } from "mongoose";
import { clearCacheForKey } from "speedgoose";
import { CharacterDeathCalculator } from "./CharacterDeathCalculator";
import { CharacterInventory } from "./CharacterInventory";
import { CharacterRespawn } from "./CharacterRespawn";
import { CharacterSkull } from "./CharacterSkull";
import { CharacterTarget } from "./CharacterTarget";
import { CharacterBuffActivator } from "./characterBuff/CharacterBuffActivator";
import { CharacterItemContainer } from "./characterItems/CharacterItemContainer";
import { CharacterWeightQueue } from "./weight/CharacterWeightQueue";

export const DROPPABLE_EQUIPMENT = [
  "head",
  "neck",
  "leftHand",
  "rightHand",
  "ring",
  "legs",
  "boot",
  "accessory",
  "armor",
];

@provide(CharacterDeath)
export class CharacterDeath {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterTarget: CharacterTarget,
    private npcTarget: NPCTarget,
    private characterInventory: CharacterInventory,
    private itemOwnership: ItemOwnership,
    private characterWeight: CharacterWeightQueue,
    private skillDecrease: SkillDecrease,
    private characterDeathCalculator: CharacterDeathCalculator,
    private characterItemContainer: CharacterItemContainer,
    private inMemoryHashTable: InMemoryHashTable,
    private characterBuffActivator: CharacterBuffActivator,
    private locker: Locker,
    private newRelic: NewRelic,
    private equipmentSlots: EquipmentSlots,
    private characterSkull: CharacterSkull,
    private discordBot: DiscordBot,
    private characterRespawn: CharacterRespawn
  ) {}

  @TrackNewRelicTransaction()
  public async handleCharacterDeath(killer: INPC | ICharacter | null, character: ICharacter): Promise<void> {
    try {
      const isLocked = await this.locker.lock(`character-death-${character._id}`, 3);

      if (!isLocked) {
        return;
      }

      const characterBody = await this.generateCharacterBody(character);

      await this.sendBattleDeathEvents(character);

      if (character.scene.includes("arena") || character.scene.includes("training")) {
        return;
      }

      await this.handleCharacterMode(character, characterBody, killer);
      await this.characterWeight.updateCharacterWeight(character);
      await this.sendRefreshEquipmentEvent(character);

      this.newRelic.trackMetric(NewRelicMetricCategory.Count, NewRelicSubCategory.Characters, "Death", 1);
    } catch (err) {
      console.error(err);
    } finally {
      // Run these tasks concurrently as they don't depend on each other
      await Promise.all([
        entityEffectUse.clearAllEntityEffects(character), // make sure to clear all entity effects before respawn
        this.clearCache(character),
        this.handleKiller(killer, character),
      ]);

      await this.characterRespawn.respawnCharacter(character);

      await this.locker.unlock(`character-death-${character._id}`);
    }
  }

  private async handleKiller(killer: INPC | ICharacter | null, character: ICharacter): Promise<void> {
    if (killer) {
      await this.clearAttackerTarget(killer);
      if (killer.type === EntityType.Character) {
        const killerCharacter = killer as ICharacter;
        await Promise.all([
          this.sendDiscordPVPMessage(killerCharacter, character),
          this.handleCharacterKiller(killerCharacter, character),
        ]);
      }
    }
  }

  private async handleCharacterKiller(killer: ICharacter, character: ICharacter): Promise<void> {
    const characterDeathLog = new CharacterPvPKillLog({
      killer: killer._id.toString(),
      target: character._id.toString(),
      isJustify: !(await this.characterSkull.checkForUnjustifiedAttack(killer, character)),
      x: character.x,
      y: character.y,
      createdAt: new Date(),
    });
    await characterDeathLog.save();

    if (!characterDeathLog.isJustify) {
      await this.characterSkull.updateSkullAfterKill(killer._id.toString());
    }
  }

  private async handleCharacterMode(
    character: ICharacter,
    characterBody: IItem,
    killer: INPC | ICharacter | null
  ): Promise<void> {
    const isKillerNPC = killer?.type === EntityType.NPC;
    const isCharacterInSoftModeWithoutSkull = character.mode === Modes.SoftMode && !character.hasSkull;
    const isCharacterInHardcoreMode = character.mode === Modes.HardcoreMode;
    const isCharacterInPermadeathMode = character.mode === Modes.PermadeathMode;
    const isCharacterInSoftModeWithSkull =
      character.mode === Modes.SoftMode && character.hasSkull && character.skullType;

    let shouldForceDropAll = false;

    if (isCharacterInPermadeathMode) {
      await this.softDeleteCharacterOnPermaDeathMode(character);
      shouldForceDropAll = true;
    } else if (isCharacterInHardcoreMode || isCharacterInSoftModeWithSkull) {
      shouldForceDropAll = false;
    }

    if (isKillerNPC && !shouldForceDropAll) {
      const killerNPC = killer as INPC;
      shouldForceDropAll =
        killerNPC.hasCustomDeathPenalty === NPCCustomDeathPenalties.Hardcore ||
        killerNPC.hasCustomDeathPenalty === NPCCustomDeathPenalties.FullLootDrop;
    }

    if (!isCharacterInSoftModeWithoutSkull) {
      await this.applyPenalties(character, characterBody, shouldForceDropAll);
    }
  }

  @TrackNewRelicTransaction()
  public async generateCharacterBody(character: ICharacter): Promise<IItem> {
    const blueprintData = blueprintManager.getBlueprint<IItem>("items", BodiesBlueprint.CharacterBody);

    const charBody = new Item({
      ...blueprintData,
      bodyFromId: character._id,
      name: `${character.name}'s body`,
      scene: character.scene,
      texturePath: `${character.textureKey}/death/0.png`,
      x: character.x,
      y: character.y,
      deadBodyEntityType: EntityType.Character,
    });

    await charBody.save();

    return charBody;
  }

  private async sendBattleDeathEvents(character: ICharacter): Promise<void> {
    const characterDeathData: IBattleDeath = {
      id: character.id,
      type: "Character",
    };

    this.socketMessaging.sendEventToUser(character.channelId!, BattleSocketEvents.BattleDeath, characterDeathData);

    // communicate all players around that character is dead

    await this.socketMessaging.sendEventToCharactersAroundCharacter<IBattleDeath>(
      character,
      BattleSocketEvents.BattleDeath,
      characterDeathData
    );
  }

  private async sendDiscordPVPMessage(killer: ICharacter, target: ICharacter): Promise<void> {
    const wasPVPDeath = killer.type === EntityType.Character && target.type === EntityType.Character;

    if (wasPVPDeath) {
      const messages = [
        `Looks like ${killer.name} sent ${target.name} back to the drawing board!`,
        `${killer.name} just made mincemeat out of ${target.name}.`,
        `And down goes ${target.name}! ${killer.name} stands triumphant.`,
        `${killer.name} just rewrote ${target.name}'s life code. #GameOver`,
        `Epic showdown! ${killer.name} reigns and ${target.name} feels the pain.`,
        `${killer.name} just sent ${target.name} to the respawn point.`,
        `Looks like ${killer.name} just banished ${target.name} to the shadow realm.`,
        `${killer.name} unleashed havoc, and now ${target.name} is no more.`,
        `It's a critical hit! ${killer.name} obliterates ${target.name}.`,
        `${killer.name} has claimed victory, while ${target.name} bites the dust.`,
        `Curtains for ${target.name}! ${killer.name} takes the spotlight.`,
        `${killer.name} slays ${target.name}, offering them a one-way ticket to the afterlife.`,
        `A devastating blow by ${killer.name} leaves ${target.name} in ruins.`,
        `${killer.name} has reduced ${target.name} to mere pixels.`,
        `RIP ${target.name}. ${killer.name} adds another notch to their belt.`,
        `${killer.name} has nullified ${target.name}'s existence. Back to square one.`,
        `${killer.name} shows no mercy, wiping ${target.name} off the map.`,
        `Game over for ${target.name}! ${killer.name} claims another trophy.`,
        `It's a knockout! ${killer.name} leaves ${target.name} in the dust.`,
        `${killer.name} delivers the final blow, sending ${target.name} back to the lobby.`,
        `Victory is sweet for ${killer.name}, but it's game over for ${target.name}.`,
        `${killer.name} has spoken, and ${target.name} fades into oblivion.`,
        `${killer.name} has just made ${target.name} a ghost of their former self.`,
        `It's a finishing move! ${killer.name} eliminates ${target.name} from play.`,
        `${killer.name} makes quick work of ${target.name}, ending their journey.`,
        `In a flash of brilliance, ${killer.name} dismantles ${target.name}.`,
      ];

      const randomIndex = Math.floor(Math.random() * messages.length);
      const selectedMessage = messages[randomIndex];

      await this.discordBot.sendMessage(`**PVP Death:** ${selectedMessage}`, "pvp-and-wars");
    }
  }

  private async clearCache(character: ICharacter): Promise<void> {
    await Promise.all([
      this.inMemoryHashTable.delete("character-weapon", character._id),
      this.inMemoryHashTable.delete("character-max-weights", character._id),
      this.inMemoryHashTable.delete("inventory-weight", character._id),
      this.inMemoryHashTable.delete("equipment-weight", character._id),
      clearCacheForKey(`${character._id}-equipment`),
      clearCacheForKey(`${character._id}-inventory`),
      this.inMemoryHashTable.delete("equipment-slots", character._id),
      this.inMemoryHashTable.deleteAll(`${character._id}-skill-level-with-buff`),
      clearCacheForKey(`characterBuffs_${character._id}`),
      clearCacheForKey(`${character._id}-skills`),
      this.inMemoryHashTable.delete("skills-with-buff", character._id),
    ]);
  }

  private async sendRefreshEquipmentEvent(character: ICharacter): Promise<void> {
    const equipment = (await Equipment.findById(character.equipment).lean()) as IEquipment;

    const equipmentSet = await this.equipmentSlots.getEquipmentSlots(character._id, equipment._id);

    const inventory = await this.characterInventory.getInventory(character);

    const inventoryContainer = (await ItemContainer.findById(inventory?.itemContainer)) as any;

    this.socketMessaging.sendEventToUser<IEquipmentAndInventoryUpdatePayload>(
      character.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      {
        inventory: inventoryContainer,
        equipment: equipmentSet,
        openEquipmentSetOnUpdate: false,
        openInventoryOnUpdate: false,
      }
    );
  }

  private async softDeleteCharacterOnPermaDeathMode(character: ICharacter): Promise<void> {
    await Character.updateOne({ _id: character._id }, { $set: { isSoftDeleted: true } });
  }

  private async clearAttackerTarget(attacker: ICharacter | INPC): Promise<void> {
    if (attacker.type === "Character") {
      // clear killer's target
      await this.characterTarget.clearTarget(attacker as ICharacter);
    }

    if (attacker.type === "NPC") {
      await this.npcTarget.clearTarget(attacker as INPC);
    }
  }

  private async dropCharacterItemsOnBody(
    character: ICharacter,
    characterBody: IItem,
    equipmentId: Types.ObjectId | undefined,
    forceDropAll: boolean = false
  ): Promise<void> {
    if (!equipmentId) {
      return;
    }

    const equipment = await Equipment.findById(character.equipment).cacheQuery({
      cacheKey: `${character._id}-equipment`,
    });

    if (!equipment) {
      throw new Error(`No equipment found for id ${equipmentId}`);
    }

    const inventory = await this.characterInventory.getInventory(character);

    if (!inventory) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you don't have an inventory");
      return;
    }

    const bodyContainer = (await ItemContainer.findById(characterBody.itemContainer).lean({
      virtuals: true,
      defaults: true,
    })) as IItemContainer;

    if (!bodyContainer) {
      throw new Error(`Error fetching itemContainer for Item with key ${characterBody.key}`);
    }

    // there's a chance of dropping any of the equipped items
    await this.dropEquippedItemOnBody(character, bodyContainer, equipment, forceDropAll);

    // drop backpack
    if (inventory) {
      await this.dropInventory(character, bodyContainer, inventory, forceDropAll);
      await this.clearAllInventoryItems(inventory._id, character);
    }
  }

  private async clearAllInventoryItems(inventoryId: string, character: ICharacter): Promise<void> {
    const inventoryItem = await Item.findById(inventoryId).lean();

    await this.clearItem(character, inventoryItem?._id);

    const inventoryContainer = await ItemContainer.findById(inventoryItem?.itemContainer).lean();

    const bodySlots = inventoryContainer?.slots as { [key: string]: IItem };

    const clearItemPromises = Object.values(bodySlots).map((slotItem): any => {
      if (slotItem) {
        return this.clearItem(character, slotItem._id);
      }
    });

    await Promise.all(clearItemPromises);
  }

  private async dropInventory(
    character: ICharacter,
    bodyContainer: IItemContainer,
    inventory: IItem,
    forceDropAll: boolean = false
  ): Promise<void> {
    let n = _.random(1, 100);
    if (character.hasSkull && character.skullType) {
      // if has yellow, 30% more. If has red => all loss
      switch (character.skullType) {
        case CharacterSkullType.YellowSkull:
          n = n * 0.7;
          break;
        case CharacterSkullType.RedSkull:
          forceDropAll = true;
          break;
      }
    }
    let isDeadBodyLootable = false;

    const skills = (await Skill.findById(character.skills)
      .lean()
      .cacheQuery({
        cacheKey: `${character._id}-skills`,
      })) as unknown as ISkill as ISkill;

    const dropInventoryChance = await this.characterDeathCalculator.calculateInventoryDropChance(skills);

    if (n <= dropInventoryChance || forceDropAll) {
      let item = (await Item.findById(inventory._id).lean({
        virtuals: true,
        defaults: true,
      })) as IItem;

      item.itemContainer &&
        (await this.inMemoryHashTable.delete("container-all-items", item.itemContainer.toString()!));

      item = await this.clearItem(character, item._id);

      // now that the slot is clear, lets drop the item on the body
      await this.characterItemContainer.addItemToContainer(item, character, bodyContainer._id, {
        shouldAddOwnership: false,
      });

      if (!isDeadBodyLootable) {
        isDeadBodyLootable = true;
        await Item.updateOne(
          { _id: bodyContainer.parentItem },
          { $set: { isDeadBodyLootable: true, updatedAt: new Date() } }
        );
      }

      await this.characterInventory.generateNewInventory(character, ContainersBlueprint.Bag, true);
    }
  }

  private async dropEquippedItemOnBody(
    character: ICharacter,
    bodyContainer: IItemContainer,
    equipment: IEquipment,
    forceDropAll: boolean = false
  ): Promise<void> {
    let isDeadBodyLootable = false;

    const skullMultiplier = this.getSkullMultiplier(character);
    for (const slot of DROPPABLE_EQUIPMENT) {
      const itemId = equipment[slot];
      if (!itemId) continue;

      const dropChance = _.random(0, 100) * skullMultiplier;
      if (forceDropAll || dropChance <= DROP_EQUIPMENT_CHANCE) {
        try {
          const item = await this.clearItem(character, itemId);
          const removeEquipmentFromSlot = await equipmentSlots.removeItemFromSlot(
            character,
            item.key,
            slot as EquipmentSlotTypes
          );

          if (!removeEquipmentFromSlot) continue;

          await this.characterItemContainer.addItemToContainer(item, character, bodyContainer._id, {
            shouldAddOwnership: false,
          });

          isDeadBodyLootable = true;
        } catch (error) {
          console.error(error);
        }
      }
    }

    if (isDeadBodyLootable) {
      await Item.updateOne(
        { _id: bodyContainer.parentItem },
        { $set: { isDeadBodyLootable: true, updatedAt: new Date() } }
      );
    }
  }

  private getSkullMultiplier(character: ICharacter): number {
    if (!character.hasSkull || !character.skullType) return 1;

    switch (character.skullType) {
      case CharacterSkullType.YellowSkull:
        return 0.7;
      case CharacterSkullType.RedSkull:
        return 0;
      default:
        return 1;
    }
  }

  private async clearItem(character: ICharacter, itemId: string): Promise<IItem> {
    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      {
        $unset: {
          x: "",
          y: "",
          owner: "",
          scene: "",
          tiledId: "",
        },
      },
      {
        new: true,
        lean: { virtuals: true, defaults: true },
      }
    );

    if (!updatedItem) throw new Error("Item not found"); // Error handling, just in case

    if (updatedItem.itemContainer) {
      await this.itemOwnership.removeItemOwnership(updatedItem);
    }
    await this.removeAllItemBuffs(character, updatedItem);

    return updatedItem as IItem;
  }

  private async removeAllItemBuffs(character: ICharacter, item: IItem): Promise<void> {
    const itemKey = item.key;

    const buff = (await CharacterBuff.findOne({ owner: character._id, itemKey })
      .lean()
      .select("_id type")) as ICharacterBuff;

    if (buff) {
      const disableBuff = await this.characterBuffActivator.disableBuff(
        character,
        buff._id,
        buff.type as CharacterBuffType,
        true
      );

      if (!disableBuff) {
        throw new Error(`Error disabling buff ${buff._id}`);
      }
    }
  }

  private async applyPenalties(
    character: ICharacter,
    characterBody: IItem,
    forceDropAll: boolean = false
  ): Promise<void> {
    if (character.mode === Modes.PermadeathMode) {
      await this.dropCharacterItemsOnBody(character, characterBody, character.equipment, forceDropAll);
      return;
    }

    // If character mode is soft and has no skull => no penalty
    if (character.mode === Modes.SoftMode && !character.hasSkull) {
      return;
    }

    const amuletOfDeath = await equipmentSlots.hasItemByKeyOnSlot(
      character,
      AccessoriesBlueprint.AmuletOfDeath,
      "neck"
    );

    if (!amuletOfDeath || forceDropAll) {
      // drop equipped items and backpack items
      await this.dropCharacterItemsOnBody(character, characterBody, character.equipment, forceDropAll);

      const deathPenalty = await this.skillDecrease.deathPenalty(character);
      if (deathPenalty) {
        // Set timeout to not overwrite the msg "You are Died"
        setTimeout(() => {
          this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
            message: "You lost some XP and skill points.",
            type: "info",
          });
        }, 2000);
      }
    } else {
      setTimeout(() => {
        this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
          message: "Your Amulet of Death protected your XP and skill points.",
          type: "info",
        });
      }, 2000);

      await equipmentSlots.removeItemFromSlot(character, AccessoriesBlueprint.AmuletOfDeath, "neck");
    }
  }
}
