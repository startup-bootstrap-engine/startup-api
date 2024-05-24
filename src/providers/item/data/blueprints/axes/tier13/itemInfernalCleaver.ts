import { IEquippableMeleeTier13WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemInfernalCleaver: IEquippableMeleeTier13WeaponBlueprint = {
  key: AxesBlueprint.InfernalCleaver,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/infernal-cleaver.png",
  name: "Infernal Cleaver",
  description: "A hellish axe emanating flames, burning foes with every swing.",
  weight: 5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 99,
  defense: 97,
  tier: 13,
  rangeType: EntityAttackType.Melee,
  basePrice: 128,
};
