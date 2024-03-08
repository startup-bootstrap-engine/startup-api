import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CHARACTER_CLASS_DUAL_YIELD_LIST } from "@providers/constants/CharacterClassesConstants";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IEquipmentSet, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(EquipmentEquipValidator)
export class EquipmentEquipValidator {
  constructor(private socketMessaging: SocketMessaging) {}

  @TrackNewRelicTransaction()
  public async validateHandsItemEquip(
    equipmentSlots: IEquipmentSet,
    itemToBeEquipped: IItem,
    character: ICharacter
  ): Promise<boolean> {
    const leftHandItem = (await Item.findById(equipmentSlots.leftHand).lean()) as IItem;
    const rightHandItem = (await Item.findById(equipmentSlots.rightHand).lean()) as IItem;

    if (leftHandItem && rightHandItem) {
      this.sendErrorMessage(character, "Sorry, your hands are already full. Please unequip an item first.");
      return false;
    }

    if (!this.isItemEquippableOnHands(itemToBeEquipped)) {
      this.sendErrorMessage(character, "Sorry, this item is not equippable on hands.");
      return false;
    }

    if (itemToBeEquipped.isTwoHanded) {
      if (leftHandItem || rightHandItem) {
        this.sendErrorMessage(character, "Sorry, you already have an item equipped. Please unequip it first.");
        return false;
      }
      return true;
    }

    if (this.hasTwoHandedItemEquippedOnArms(leftHandItem, rightHandItem)) {
      this.sendErrorMessage(character, "Sorry, you can't equip a one-handed item with a two-handed item.");
      return false;
    }

    if (this.hasShieldEquipped(leftHandItem, rightHandItem)) {
      if (itemToBeEquipped.subType === ItemSubType.Shield) {
        this.sendErrorMessage(character, "Sorry, you can't equip another shield.");
        return false;
      }

      if (itemToBeEquipped.subType !== ItemSubType.Shield) {
        return true;
      }
    }

    if ((leftHandItem || rightHandItem) && itemToBeEquipped.type === ItemType.Weapon) {
      if (this.isDualYieldAllowed(character, leftHandItem, itemToBeEquipped)) {
        return true;
      }
      this.sendErrorMessage(character, "Sorry, your class can't equip 2 one-handed weapons of this type.");
      return false;
    }

    if (
      this.hasOneHandedItemEquippedOnArms(leftHandItem, rightHandItem) &&
      itemToBeEquipped.subType !== ItemSubType.Shield
    ) {
      this.sendErrorMessage(character, "Sorry, you can't equip another one-handed item unless it's a shield.");
      return false;
    }

    return true;
  }

  private isDualYieldAllowed(character: ICharacter, item1: IItem | null, item2: IItem | null): boolean {
    if (!item1 || !item2) {
      return false;
    }

    const allowedCombinations = CHARACTER_CLASS_DUAL_YIELD_LIST[character.class];
    if (!allowedCombinations) {
      return false;
    }

    const currentCombination = [item1.subType, item2.subType].sort();
    return allowedCombinations.some((allowedCombination) => {
      return allowedCombination.sort().every((itemSubType, index) => itemSubType === currentCombination[index]);
    });
  }

  private sendErrorMessage(character: ICharacter, message: string): void {
    this.socketMessaging.sendErrorMessageToCharacter(character, message);
  }

  private hasTwoHandedItemEquippedOnArms(leftHandItem: IItem, rightHandItem: IItem): boolean {
    if (leftHandItem?.isTwoHanded || rightHandItem?.isTwoHanded) {
      return true;
    }
    return false;
  }

  private hasOneHandedItemEquippedOnArms(leftHandItem: IItem, rightHandItem: IItem): boolean {
    if (leftHandItem?.isTwoHanded || rightHandItem?.isTwoHanded) {
      return false;
    }

    if (leftHandItem || rightHandItem) {
      return true;
    }

    return false;
  }

  private hasShieldEquipped(leftHandItem?: IItem, rightHandItem?: IItem): boolean {
    if (leftHandItem?.subType === ItemSubType.Shield || rightHandItem?.subType === ItemSubType.Shield) {
      return true;
    }

    return false;
  }

  private isItemEquippableOnHands(item: IItem): boolean {
    return !!(
      item.allowedEquipSlotType?.includes(ItemSlotType.LeftHand) ||
      item.allowedEquipSlotType?.includes(ItemSlotType.RightHand)
    );
  }
}
