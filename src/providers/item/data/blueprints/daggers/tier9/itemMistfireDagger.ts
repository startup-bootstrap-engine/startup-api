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
import { IEquippableMeleeTier9WeaponBlueprint } from "../../../types/TierBlueprintTypes";
import { DaggersBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemMistfireDagger: IEquippableMeleeTier9WeaponBlueprint = {
  key: DaggersBlueprint.MistfireDagger,
  type: ItemType.Weapon,
  subType: ItemSubType.Dagger,
  textureAtlas: "items",
  texturePath: "daggers/mistfire-dagger.png",
  name: "Mistfire Dagger",
  description: "A silent assassin's choice, its sapphire glow conceals deadly precision in a spectral mist.",
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 71,
  defense: 69,
  tier: 9,
  rangeType: EntityAttackType.Melee,
  basePrice: 88,
  entityEffects: [EntityEffectBlueprint.Burning],
  entityEffectChance: 85,
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
      buffPercentage: 5,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of dexterity flowing through your body. (+5% dexterity)",
          deactivation: "You feel the power of dexterity leaving your body. (-5% dexterity)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases resistance by 6%, dagger by 6% and dexterity by 5% respectively",
};
