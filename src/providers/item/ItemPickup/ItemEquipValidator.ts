import { Character } from "@entities/ModuleCharacter/CharacterModel";
import { Item } from "@entities/ModuleInventory/ItemModel";
import { EquipmentSlots } from "@providers/equipment/EquipmentSlots";
import { ICharacter, IItem, ItemSubType, ItemType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { Types } from "mongoose";

@provide(ItemEquipValidator)
export class ItemEquipValidator {
  constructor(private equipmentSlots: EquipmentSlots) {}

  public async canEquipItem(characterId: Types.ObjectId, itemId: Types.ObjectId): Promise<boolean> {
    const character = (await Character.findById(characterId).lean()) as ICharacter;

    const itemToBeEquipped = (await Item.findById(itemId).lean()) as IItem;

    if (itemToBeEquipped.type !== ItemType.Weapon) {
      return true;
    }

    const equipmentSlots = await this.equipmentSlots.getEquipmentSlots(character._id, character.equipment as string);
    const leftHandItem = (await Item.findById(equipmentSlots.leftHand).lean()) as IItem;
    const rightHandItem = (await Item.findById(equipmentSlots.rightHand).lean()) as IItem;

    if (!rightHandItem && !leftHandItem) {
      return true;
    }

    if (
      (this.isOneHandedWeapon(leftHandItem) && this.isOneHandedWeapon(itemToBeEquipped) && !rightHandItem) ||
      (this.isOneHandedWeapon(rightHandItem) && this.isOneHandedWeapon(itemToBeEquipped) && !leftHandItem)
    ) {
      return true;
    } else {
      return false;
    }
  }

  private isOneHandedWeapon(item: IItem): boolean {
    return (item?.subType === ItemSubType.Sword || item?.subType === ItemSubType.Axe) && !item.isTwoHanded;
  }
}
