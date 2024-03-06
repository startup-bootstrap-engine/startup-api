import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier14WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemDualImpactAxe: IEquippableMeleeTier14WeaponBlueprint = {
  key: AxesBlueprint.DualImpactAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/dual-impact-axe.png",
  name: "Dual Impact Axe",
  description: "Precision cleaving and impactful knock, versatile combat effectiveness.",
  weight: 5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 103,
  defense: 101,
  tier: 14,
  rangeType: EntityAttackType.Melee,
  basePrice: 130,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 85,
};
