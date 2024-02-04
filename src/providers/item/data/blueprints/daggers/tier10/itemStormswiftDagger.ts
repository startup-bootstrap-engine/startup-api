import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  CombatSkill,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { IEquippableMeleeTier10WeaponBlueprint } from "../../../types/TierBlueprintTypes";
import { DaggersBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemStormswiftDagger: IEquippableMeleeTier10WeaponBlueprint = {
  key: DaggersBlueprint.StormswiftDagger,
  type: ItemType.Weapon,
  subType: ItemSubType.Dagger,
  textureAtlas: "items",
  texturePath: "daggers/stormswift-dagger.png",
  name: "Stormswift Dagger",
  description: "Swift as a storm, gleams with tempest force, an agile weapon harnessing nature's wrath.",
  weight: 2.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 75,
  defense: 71,
  tier: 10,
  rangeType: EntityAttackType.Melee,
  basePrice: 100,
  entityEffects: [EntityEffectBlueprint.Freezing],
  entityEffectChance: 90,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 6,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of resistance flowing through your body. (+6% resistance)",
          deactivation: "You feel the power of resistance leaving your body. (-6% resistance)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Dagger,
      buffPercentage: 6,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of dagger flowing through your body. (+6% dagger)",
          deactivation: "You feel the power of dagger leaving your body. (-6% dagger)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Dexterity,
      buffPercentage: 6,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of dexterity flowing through your body. (+6% dexterity)",
          deactivation: "You feel the power of dexterity leaving your body. (-6% dexterity)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases resistance by 6%, dagger by 6% and dexterity by 6% respectively",
};
