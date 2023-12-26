import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { CharacterClass, IEquipmentSet, ItemSlotType, ItemSubType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(EquipmentTwoHanded)
export class EquipmentTwoHanded {
  constructor(private socketMessaging: SocketMessaging) {}

  @TrackNewRelicTransaction()
  public async validateHandsItemEquip(
    equipmentSlots: IEquipmentSet,
    itemToBeEquipped: IItem,
    character: ICharacter
  ): Promise<boolean> {
    const isItemEquippableOnHands = this.isItemEquippableOnHands(itemToBeEquipped);

    if (!isItemEquippableOnHands) {
      return true;
    }

    const hasOneHandedItemEquipped = await this.hasOneHandedItemEquippedOnArms(equipmentSlots);

    if (hasOneHandedItemEquipped) {
      if (itemToBeEquipped.isTwoHanded) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Sorry, you can't equip a two-handed item together with the equipped item."
        );

        return false;
      } else {
        const hasShield = await this.hasShieldEquipped(equipmentSlots);

        if (hasShield) {
          return true;
        }

        // if item to be equipped is a shield, just allow it
        if (itemToBeEquipped.subType === ItemSubType.Shield) {
          return true;
        }

        if (
          character.class === CharacterClass.Berserker ||
          character.class === CharacterClass.Rogue ||
          character.class === CharacterClass.Warrior
        ) {
          return true;
        }

        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Sorry, your class can't equip 2 one-handed item of this type."
        );

        return false;
      }
    }

    const hasTwoHandedItemEquipped = await this.hasTwoHandedItemEquippedOnArms(
      equipmentSlots as unknown as IEquipmentSet
    );

    if (hasTwoHandedItemEquipped) {
      if (itemToBeEquipped.isTwoHanded) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Sorry, you already have a two-handed item equipped."
        );

        return false;
      }

      if (!itemToBeEquipped.isTwoHanded) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Sorry, not possible. Please unequip your two-handed item first."
        );

        return false;
      }
    }

    return true;
  }

  @TrackNewRelicTransaction()
  public async hasTwoHandedItemEquippedOnArms(equipment: IEquipmentSet): Promise<boolean> {
    const leftHandItem = await Item.findById(equipment.leftHand);
    const rightHandItem = await Item.findById(equipment.rightHand);

    if (leftHandItem?.isTwoHanded || rightHandItem?.isTwoHanded) {
      return true;
    }
    return false;
  }

  @TrackNewRelicTransaction()
  public async hasOneHandedItemEquippedOnArms(equipment: IEquipmentSet): Promise<boolean> {
    const leftHandItem = await Item.findById(equipment.leftHand);
    const rightHandItem = await Item.findById(equipment.rightHand);

    if (leftHandItem?.isTwoHanded || rightHandItem?.isTwoHanded) {
      return false;
    }

    if (leftHandItem || rightHandItem) {
      return true;
    }

    return false;
  }

  @TrackNewRelicTransaction()
  public async hasShieldEquipped(equipment: IEquipmentSet): Promise<boolean> {
    const leftHandItem = await Item.findById(equipment.leftHand);
    const rightHandItem = await Item.findById(equipment.rightHand);

    if (leftHandItem?.subType === ItemSubType.Shield || rightHandItem?.subType === ItemSubType.Shield) {
      return true;
    }

    return false;
  }

  public isItemEquippableOnHands(item: IItem): boolean {
    return !!(
      item.allowedEquipSlotType?.includes(ItemSlotType.LeftHand) ||
      item.allowedEquipSlotType?.includes(ItemSlotType.RightHand)
    );
  }
}
