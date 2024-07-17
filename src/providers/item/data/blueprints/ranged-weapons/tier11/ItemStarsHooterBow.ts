import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableRangedTier11WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
  RangeTypes,
} from "@rpg-engine/shared";
import { RangedWeaponsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemStarsHooterBow: IEquippableRangedTier11WeaponBlueprint = {
  key: RangedWeaponsBlueprint.StarsHooterBow,
  type: ItemType.Weapon,
  rangeType: EntityAttackType.Ranged,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/stars-hooter-bow.png",
  name: "Stars Hooter Bow",
  description:
    "Forged from meteoric iron, this bow shoots arrows that explode like mini supernovas. Ideal for area denial.",
  attack: 85,
  weight: 1.2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  maxRange: RangeTypes.High,
  requiredAmmoKeys: [
    RangedWeaponsBlueprint.Arrow,
    RangedWeaponsBlueprint.IronArrow,
    RangedWeaponsBlueprint.PoisonArrow,
    RangedWeaponsBlueprint.ShockArrow,
    RangedWeaponsBlueprint.GoldenArrow,
    RangedWeaponsBlueprint.EmeraldArrow,
    RangedWeaponsBlueprint.CrimsonArrow,
    RangedWeaponsBlueprint.WardenArrow,
    RangedWeaponsBlueprint.SunflareArrow,
    RangedWeaponsBlueprint.EarthArrow,
    RangedWeaponsBlueprint.SilvermoonArrow,
    RangedWeaponsBlueprint.HeartseekerArrow,
    RangedWeaponsBlueprint.SeekerArrow,
    RangedWeaponsBlueprint.CrystallineArrow,
    RangedWeaponsBlueprint.MysticMeadowArrow,
  ],
  tier: 11,
  isTwoHanded: true,
  basePrice: 220,
  entityEffects: [EntityEffectBlueprint.Burning],
  entityEffectChance: 100,
  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 14,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 14,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 12,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription: "Increases max health by 14%, strength by 14% and resistance by 12%.",
};
