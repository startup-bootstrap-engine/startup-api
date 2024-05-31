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
import { IEquippableMeleeTier12WeaponBlueprint } from "../../../types/TierBlueprintTypes";
import { DaggersBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemAzurefireDagger: IEquippableMeleeTier12WeaponBlueprint = {
  key: DaggersBlueprint.AzurefireDagger,
  type: ItemType.Weapon,
  subType: ItemSubType.Dagger,
  textureAtlas: "items",
  texturePath: "daggers/azurefire-dagger.png",
  name: "Azurefire Dagger",
  description: "Forged from the flames of an azure fire, this dagger burns with an otherworldly intensity.",
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 87,
  defense: 80,
  tier: 12,
  rangeType: EntityAttackType.Melee,
  basePrice: 145,
  entityEffects: [EntityEffectBlueprint.Burning],
  entityEffectChance: 88,
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
