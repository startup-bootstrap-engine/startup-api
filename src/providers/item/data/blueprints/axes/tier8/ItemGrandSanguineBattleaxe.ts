import { IEquippableTwoHandedTier8WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";

export const itemGrandSanguineBattleaxe: IEquippableTwoHandedTier8WeaponBlueprint = {
  key: AxesBlueprint.GrandSanguineBattleaxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/grand-sanguine-battleaxe.png",
  name: "Grand Sanguine Battleaxe",
  description:
    "Drenched in a deep crimson hue, this double-bladed battleaxe is said to thirst for blood, healing the wielder for a fraction of the damage dealt.",
  weight: 4.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 136,
  defense: 60,
  tier: 8,
  isTwoHanded: true,
  rangeType: EntityAttackType.Melee,
  basePrice: 120,

  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 90,

  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 9,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 9,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 9,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription: "Increases max health by 9%, strength by 9% and resistance by 9%.",
};
