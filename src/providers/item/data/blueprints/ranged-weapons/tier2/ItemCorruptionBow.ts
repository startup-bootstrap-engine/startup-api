import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType, RangeTypes } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { IEquippableRangedTier2WeaponBlueprint } from "../../../types/TierBlueprintTypes";
import { RangedWeaponsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemCorruptionBow: IEquippableRangedTier2WeaponBlueprint = {
  key: RangedWeaponsBlueprint.CorruptionBow,
  type: ItemType.Weapon,
  rangeType: EntityAttackType.Ranged,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/corruption-bow.png",
  name: "Corruption Bow",
  description:
    "A bow imbued with dark, otherworldly energy. It is said to be able to ignite the air around it and to be capable of shooting corruption bolts with great force and accuracy.",
  attack: 24,
  weight: 1,
  tier: 2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  maxRange: RangeTypes.High,
  requiredAmmoKeys: [RangedWeaponsBlueprint.Arrow, RangedWeaponsBlueprint.IronArrow, RangedWeaponsBlueprint.FrostArrow],
  isTwoHanded: true,
  basePrice: 70,
  entityEffects: [EntityEffectBlueprint.Corruption],
  entityEffectChance: 70,
};
