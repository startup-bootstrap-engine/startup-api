import { IItem } from "@entities/ModuleInventory/ItemModel";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { RangedWeaponsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemEldensBow: Partial<IItem> = {
  key: RangedWeaponsBlueprint.EldensBow,
  type: ItemType.Weapon,
  rangeType: EntityAttackType.Ranged,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/elden's-bow.png",
  name: "Elden's Bow",
  description:
    "A powerful, enchanted bow said to have belonged to a great hero of legend. It is said to be capable of shooting arrows with incredible speed and accuracy.",
  attack: 5,
  defense: 4,
  weight: 1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  maxRange: 8,
  requiredAmmoKeys: [RangedWeaponsBlueprint.Arrow, RangedWeaponsBlueprint.IronArrow],
  isTwoHanded: true,
  basePrice: 65,
};