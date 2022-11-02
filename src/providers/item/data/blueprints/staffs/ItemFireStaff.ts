import { IItem } from "@entities/ModuleInventory/ItemModel";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { StaffsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemFireStaff: Partial<IItem> = {
  key: StaffsBlueprint.FireStaff,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "staffs/fire-staff.png",
  name: "Fire Staff",
  description: "A staff with an fire ember gem at the top.",
  attack: 9,
  defense: 4,
  weight: 1,
  isTwoHanded: true,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  sellPrice: 100,
};
