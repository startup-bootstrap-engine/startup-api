/* eslint-disable array-callback-return */
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterPvPKillLog } from "@entities/ModuleCharacter/CharacterPvPKillLogModel";
import { Equipment, IEquipment } from "@entities/ModuleCharacter/EquipmentModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { DiscordBot } from "@providers/discord/DiscordBot";
import { EquipmentSlots } from "@providers/equipment/EquipmentSlots";
import { blueprintManager, entityEffectUse } from "@providers/inversify/container";
import { BodiesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { Locker } from "@providers/locks/Locker";
import { NPCTarget } from "@providers/npc/movement/NPCTarget";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import {
  BattleSocketEvents,
  EntityType,
  IBattleDeath,
  IEquipmentAndInventoryUpdatePayload,
  ItemSocketEvents,
  Modes,
  NPCCustomDeathPenalties,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { clearCacheForKey } from "speedgoose";
import { CharacterInventory } from "../CharacterInventory";
import { CharacterRespawn } from "../CharacterRespawn";
import { CharacterSkull } from "../CharacterSkull";
import { CharacterTarget } from "../CharacterTarget";
import { CharacterWeightQueue } from "../weight/CharacterWeightQueue";
import { CharacterDeathPenalties } from "./CharacterDeathPenalties";

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
    private characterWeight: CharacterWeightQueue,

    private inMemoryHashTable: InMemoryHashTable,
    private locker: Locker,
    private newRelic: NewRelic,
    private equipmentSlots: EquipmentSlots,
    private characterSkull: CharacterSkull,
    private discordBot: DiscordBot,
    private characterRespawn: CharacterRespawn,
    private characterDeathPenalties: CharacterDeathPenalties,
    private dynamicQueue: DynamicQueue
  ) {}

  public async handleCharacterDeath(killer: INPC | ICharacter | null, character: ICharacter): Promise<void> {
    const canProceed = await this.locker.lock(`character-death-${character._id}`, 2);

    if (!canProceed) {
      return;
    }

    if (appEnv.general.IS_UNIT_TEST) {
      return this.execHandleCharacterDeath(killer, character);
    }

    await this.dynamicQueue.addJob(
      "character-death",
      (job) => {
        const { character, killer } = job.data;

        void this.execHandleCharacterDeath(killer, character);
      },
      {
        character,
        killer,
      }
    );
  }

  @TrackNewRelicTransaction()
  public async execHandleCharacterDeath(killer: INPC | ICharacter | null, character: ICharacter): Promise<void> {
    try {
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
      throw err;
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
    // eslint-disable-next-line mongoose-lean/require-lean
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
      await this.characterDeathPenalties.softDeleteCharacterOnPermaDeathMode(character);
      shouldForceDropAll = true;
    } else if (isCharacterInHardcoreMode || isCharacterInSoftModeWithSkull) {
      shouldForceDropAll = false;
    }

    if (isKillerNPC && !shouldForceDropAll) {
      const killerNPC = killer as INPC;
      shouldForceDropAll = killerNPC.hasCustomDeathPenalty === NPCCustomDeathPenalties.FullLootDrop;
    }

    if (!isCharacterInSoftModeWithoutSkull) {
      await this.characterDeathPenalties.applyPenalties(character, characterBody, shouldForceDropAll);
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

    // eslint-disable-next-line mongoose-lean/require-lean
    await charBody.save();

    return charBody;
  }

  private async sendBattleDeathEvents(character: ICharacter): Promise<void> {
    const characterDeathData: IBattleDeath = {
      id: character._id,
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

    const inventoryContainer = (await ItemContainer.findById(inventory?.itemContainer).lean({
      virtuals: true,
      defaults: true,
    })) as any;

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

  private async clearAttackerTarget(attacker: ICharacter | INPC): Promise<void> {
    if (attacker.type === "Character") {
      // clear killer's target
      await this.characterTarget.clearTarget(attacker as ICharacter);
    }

    if (attacker.type === "NPC") {
      await this.npcTarget.clearTarget(attacker as INPC);
    }
  }
}
