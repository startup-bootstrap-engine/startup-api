import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment, IEquipment } from "@entities/ModuleCharacter/EquipmentModel";
import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CharacterBuffValidation } from "@providers/character/characterBuff/CharacterBuffValidation";
import { CharacterItemBuff } from "@providers/character/characterBuff/CharacterItemBuff";
import { CharacterItemInventory } from "@providers/character/characterItems/CharacterItemInventory";
import { CharacterWeightQueue } from "@providers/character/weight/CharacterWeightQueue";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { blueprintManager } from "@providers/inversify/container";
import { ItemOwnership } from "@providers/item/ItemOwnership";
import { ItemPickupUpdater } from "@providers/item/ItemPickup/ItemPickupUpdater";
import { ItemView } from "@providers/item/ItemView";
import { AvailableBlueprints } from "@providers/item/data/types/itemsBlueprintTypes";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  IBaseItemBlueprint,
  IEquipmentAndInventoryUpdatePayload,
  ItemSlotType,
  ItemSocketEvents,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { clearCacheForKey } from "speedgoose";
import { EquipmentCharacterClass } from "./ EquipmentCharacterClass";
import { EquipmentEquipValidator } from "./EquipmentEquipValidator";
import { EquipmentSlots } from "./EquipmentSlots";

export type SourceEquipContainerType = "inventory" | "container";
@provide(EquipmentEquip)
export class EquipmentEquip {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterItemInventory: CharacterItemInventory,
    private equipmentSlots: EquipmentSlots,
    private characterValidation: CharacterValidation,
    private equipmentEquipValidator: EquipmentEquipValidator,
    private itemOwnership: ItemOwnership,
    private characterInventory: CharacterInventory,
    private inMemoryHashTable: InMemoryHashTable,
    private itemView: ItemView,
    private characterWeight: CharacterWeightQueue,
    private itemPickupUpdater: ItemPickupUpdater,
    private characterItemBuff: CharacterItemBuff,
    private equipmentCharacterClass: EquipmentCharacterClass,
    private characterBuffValidation: CharacterBuffValidation
  ) {}

  @TrackNewRelicTransaction()
  public async equipInventory(character: ICharacter, itemId: string): Promise<boolean> {
    const item = await Item.findById(itemId);
    if (!item) return this.sendError(character, "Item not found.");

    if (!item.isItemContainer) return this.sendError(character, "Cannot equip this as an inventory.");

    const equipment = await Equipment.findById(character.equipment);
    if (!equipment) return this.sendError(character, "Equipment not found.");

    await Equipment.updateOne({ _id: equipment._id }, { $set: { inventory: item._id } });

    const inventory = await this.characterInventory.getInventory(character);
    if (!inventory) return this.sendError(character, "Inventory not found.");

    const inventoryContainer = await ItemContainer.findById(inventory.itemContainer);
    if (!inventoryContainer) return this.sendError(character, "Inventory container not found.");

    await this.itemView.removeItemFromMap(item);
    await this.finalizeEquipItem(inventoryContainer, equipment, item, character);
    await this.clearCaches(character);
    await this.characterWeight.updateCharacterWeight(character);

    return true;
  }

  @TrackNewRelicTransaction()
  public async equip(character: ICharacter, itemId: string, fromItemContainerId: string): Promise<boolean> {
    const item = await Item.findById(itemId);
    if (!item) return this.sendError(character, "Item not found.");

    try {
      const itemContainer = await ItemContainer.findById(fromItemContainerId);
      if (!itemContainer) return this.sendError(character, "Item container not found.");

      const containerType = await this.checkContainerType(itemContainer);
      if (!(await this.isEquipValid(character, item, containerType))) return false;

      const equipment = await Equipment.findById(character.equipment);
      if (!equipment) return this.sendError(character, "Equipment not found.");

      if (!(await this.equipmentSlots.addItemToEquipmentSlot(character, item, equipment, itemContainer))) return false;

      const inventory = await this.characterInventory.getInventory(character);
      const inventoryContainer = await ItemContainer.findById(inventory?.itemContainer);
      if (!inventoryContainer) return this.sendError(character, "Failed to equip item.");

      const updatedContainer = (await ItemContainer.findById(fromItemContainerId)) as any;
      await this.itemPickupUpdater.sendContainerRead(updatedContainer, character);

      await this.finalizeEquipItem(inventoryContainer, equipment, item, character);
      await this.clearCaches(character);
      await this.characterBuffValidation.removeDuplicatedBuffs(character);

      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      await item.save();
    }
  }

  private async finalizeEquipItem(
    inventoryContainer: IItemContainer,
    equipment: IEquipment,
    item: IItem,
    character: ICharacter
  ): Promise<void> {
    try {
      const equipmentSlots = await this.equipmentSlots.getEquipmentSlots(character._id, equipment._id);
      const payloadUpdate: IEquipmentAndInventoryUpdatePayload = {
        equipment: equipmentSlots,
        inventory: inventoryContainer as any,
      };

      this.updateItemInventoryCharacter(payloadUpdate, character);
      await Item.updateOne({ _id: item._id }, { isEquipped: true });
      if (item.x || item.y || item.scene) {
        await Item.updateOne({ _id: item._id }, { $unset: { x: "", y: "", scene: "" } });
      }

      await this.clearCaches(character);
      await this.characterWeight.updateCharacterWeight(character);
      await this.characterItemBuff.enableItemBuff(character, item);

      const newEquipmentSlots = await this.equipmentSlots.getEquipmentSlots(character._id, equipment._id);
      this.updateItemInventoryCharacter(
        { equipment: newEquipmentSlots, inventory: inventoryContainer as any },
        character
      );
    } catch (error) {
      console.error(error);
    } finally {
      if (!item.owner) {
        await this.itemOwnership.addItemOwnership(item, character);
      }
    }
  }

  private async clearCaches(character: ICharacter): Promise<void> {
    const cacheKeys = [
      `${character._id}-inventory`,
      `${character._id}-equipment`,
      `characterBuffs_${character._id}`,
      `${character._id}-skills`,
      "skills-with-buff",
      "equipment-slots",
      "character-shield",
      "character-weapon",
    ];

    await Promise.all(cacheKeys.map((key) => clearCacheForKey(key)));
  }

  private async checkContainerType(itemContainer: IItemContainer): Promise<SourceEquipContainerType> {
    const parentItem = await Item.findById(itemContainer.parentItem);
    if (!parentItem) throw new Error("Parent item not found");

    return parentItem.allowedEquipSlotType?.includes(ItemSlotType.Inventory) ? "inventory" : "container";
  }

  private async isEquipValid(
    character: ICharacter,
    item: IItem,
    containerType: SourceEquipContainerType
  ): Promise<boolean> {
    const allowedSubTypes = [ItemSubType.Book, ItemSubType.Shield];

    if (item.type === ItemType.Weapon || allowedSubTypes.includes(item.subType as ItemSubType)) {
      if (!this.equipmentCharacterClass.isItemAllowed(character.class, item.subType)) {
        return this.sendError(character, `Your class is not allowed to use ${item.subType.toLowerCase()} items.`);
      }
    }

    if (!(await this.characterValidation.hasBasicValidation(character))) return false;

    const itemBlueprint = await blueprintManager.getBlueprint<IBaseItemBlueprint>(
      "items",
      item.key as AvailableBlueprints
    );

    if (itemBlueprint?.minRequirements && !(await this.checkMinimumRequirements(character, itemBlueprint))) {
      const { level, skill } = itemBlueprint.minRequirements;
      return this.sendError(
        character,
        `You don't meet the requirements: level ${level}, ${skill.name} level ${skill.level}`
      );
    }

    if (containerType === "inventory") {
      const allItemsInInventory = await this.characterItemInventory.getAllItemsFromInventoryNested(character);
      if (!allItemsInInventory.some((inventoryItem) => inventoryItem._id.toString() === item._id.toString())) {
        return this.sendError(character, "Item not found in your inventory.");
      }
    }

    const equipmentSlots = await this.equipmentSlots.getEquipmentSlots(
      character._id,
      character.equipment as unknown as string
    );
    if (
      item.allowedEquipSlotType?.includes(ItemSlotType.LeftHand) ||
      item.allowedEquipSlotType?.includes(ItemSlotType.RightHand)
    ) {
      return await this.equipmentEquipValidator.validateHandsItemEquip(equipmentSlots, item, character);
    }

    return true;
  }

  private async checkMinimumRequirements(character: ICharacter, itemBlueprint: IBaseItemBlueprint): Promise<boolean> {
    const skill = await Skill.findById(character.skills).lean();

    if (!skill) return this.sendError(character, "Skills not found.");

    const minRequirements = itemBlueprint.minRequirements;
    if (!minRequirements) return true;

    if (skill.level < minRequirements.level) return false;

    const skillsLevel = skill[minRequirements.skill.name]?.level ?? 0;
    return skillsLevel >= minRequirements.skill.level;
  }

  private sendError(character: ICharacter, message: string): boolean {
    this.socketMessaging.sendErrorMessageToCharacter(character, message);
    return false;
  }

  private updateItemInventoryCharacter(
    equipmentAndInventoryUpdate: IEquipmentAndInventoryUpdatePayload,
    character: ICharacter
  ): void {
    this.socketMessaging.sendEventToUser<IEquipmentAndInventoryUpdatePayload>(
      character.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      equipmentAndInventoryUpdate
    );
  }

  public getAllowedItemTypes(): ItemType[] {
    return Object.keys(ItemType).map((key) => ItemType[key]);
  }
}
