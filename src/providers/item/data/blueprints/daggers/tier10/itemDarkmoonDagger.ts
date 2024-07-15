import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier10WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  CombatSkill,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { DaggersBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemDarkmoonDagger: IEquippableMeleeTier10WeaponBlueprint = {
  key: DaggersBlueprint.DarkmoonDagger,
  type: ItemType.Weapon,
  subType: ItemSubType.Dagger,
  textureAtlas: "items",
  texturePath: "daggers/darkmoon-dagger.png",
  name: "Darkmoon Dagger",
  description: "Black blade, spooky light, hidden in shadows, a secret weapon for sneaky, deadly tasks.",
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 77,
  defense: 72,
  tier: 10,
  rangeType: EntityAttackType.Melee,
  basePrice: 110,
  entityEffects: [EntityEffectBlueprint.Poison],
  entityEffectChance: 100,
  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 11,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 11,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 11,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription: "Increases max health by 11%, strength by 11% and resistance by 11%.",
};
