/* eslint-disable array-callback-return */
import { CharacterBuff } from "@entities/ModuleCharacter/CharacterBuffModel";
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment, IEquipment } from "@entities/ModuleCharacter/EquipmentModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { DROP_EQUIPMENT_CHANCE } from "@providers/constants/DeathConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { EquipmentSlotTypes, EquipmentSlots } from "@providers/equipment/EquipmentSlots";
import { equipmentSlots } from "@providers/inversify/container";
import { ItemOwnership } from "@providers/item/ItemOwnership";
import { AccessoriesBlueprint, ContainersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { SkillDecrease } from "@providers/skill/SkillDecrease";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  CharacterBuffType,
  CharacterSkullType,
  ICharacterBuff,
  IItemContainer,
  IUIShowMessage,
  Modes,
  UISocketEvents,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import _ from "lodash";
import { Types } from "mongoose";
import { CharacterDeathCalculator } from "../CharacterDeathCalculator";
import { CharacterInventory } from "../CharacterInventory";
import { CharacterBuffActivator } from "../characterBuff/CharacterBuffActivator";
import { CharacterItemContainer } from "../characterItems/CharacterItemContainer";
import { DROPPABLE_EQUIPMENT } from "./CharacterDeath";

@provide(CharacterDeathPenalties)
export class CharacterDeathPenalties {
  constructor(
    private equipmentSlots: EquipmentSlots,
    private skillDecrease: SkillDecrease,
    private socketMessaging: SocketMessaging,
    private characterItemContainer: CharacterItemContainer,
    private itemOwnership: ItemOwnership,
    private characterBuffActivator: CharacterBuffActivator,
    private characterInventory: CharacterInventory,
    private inMemoryHashTable: InMemoryHashTable,
    private characterDeathCalculator: CharacterDeathCalculator
  ) {}

  public async applyPenalties(
    character: ICharacter,
    characterBody: IItem,
    forceDropAll: boolean = false
  ): Promise<void> {
    if (character.mode === Modes.PermadeathMode) {
      await this.dropCharacterItemsOnBody(character, characterBody, character.equipment, true);
      return;
    }

    // If character mode is soft and has no skull => no penalty
    if (character.mode === Modes.SoftMode && !character.hasSkull) {
      return;
    }

    const amuletOfDeath = await this.equipmentSlots.hasItemByKeyOnSlot(
      character,
      AccessoriesBlueprint.AmuletOfDeath,
      "neck"
    );

    if (amuletOfDeath) {
      // Amulet of Death protects against all penalties, including hasCustomDeathPenalty
      try {
        await this.equipmentSlots.removeItemFromSlot(character, AccessoriesBlueprint.AmuletOfDeath, "neck");
        setTimeout(() => {
          this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
            message: "Your Amulet of Death protected your items, XP, and skill points.",
            type: "info",
          });
        }, 2000);
      } catch (error) {
        console.error("Failed to remove Amulet of Death:", error);
      }
    } else {
      await this.dropCharacterItemsOnBody(character, characterBody, character.equipment, forceDropAll);
      const deathPenalty = await this.skillDecrease.deathPenalty(character);

      if (deathPenalty) {
        setTimeout(() => {
          this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
            message: "You lost some items, XP, and skill points.",
            type: "info",
          });
        }, 2000);
      }
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
        buff._id!,
        buff.type as CharacterBuffType,
        true
      );

      if (!disableBuff) {
        throw new Error(`Error disabling buff ${buff._id}`);
      }
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

    const equipment = await Equipment.findById(character.equipment)
      .lean<IEquipment>()
      .cacheQuery({
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

    const skills = await Skill.findById(character.skills)
      .lean<ISkill>()
      .cacheQuery({
        cacheKey: `${character._id}-skills`,
      });

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

  public async softDeleteCharacterOnPermaDeathMode(character: ICharacter): Promise<void> {
    await Character.updateOne({ _id: character._id }, { $set: { isSoftDeleted: true } });
  }
}
