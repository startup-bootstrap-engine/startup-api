import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableRangedTier12WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
  RangeTypes,
} from "@rpg-engine/shared";
import { RangedWeaponsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemUmbralBow: IEquippableRangedTier12WeaponBlueprint = {
  key: RangedWeaponsBlueprint.UmbralBow,
  type: ItemType.Weapon,
  rangeType: EntityAttackType.Ranged,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/umbral-bow.png",
  name: "Umbral Bow",
  description:
    "Crafted during a lunar eclipse, this bow exudes a shadowy aura. Its arrows phase through darkness, making them nearly impossible to dodge.",
  attack: 92,
  weight: 1.5,
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
    RangedWeaponsBlueprint.PlasmaPierceArrow,
  ],
  tier: 12,
  isTwoHanded: true,
  basePrice: 230,
  entityEffects: [EntityEffectBlueprint.Corruption],
  entityEffectChance: 90,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Resistance,
    buffPercentage: 7,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of resistance flowing through your body. (+7% resistance)",
        deactivation: "You feel the power of resistance leaving your body. (-7% resistance)",
      },
    },
  },
  equippedBuffDescription: "Increases resistance by 7%",
};
