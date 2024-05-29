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
import { IEquippableMeleeTier11WeaponBlueprint } from "../../../types/TierBlueprintTypes";
import { DaggersBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemStarshardDagger: IEquippableMeleeTier11WeaponBlueprint = {
  key: DaggersBlueprint.StarshardDagger,
  type: ItemType.Weapon,
  subType: ItemSubType.Dagger,
  textureAtlas: "items",
  texturePath: "daggers/starshard-dagger.png",
  name: "Starshard Dagger",
  description: "Shiny like space, cuts well, fast and deadly, a special weapon for sneaky killings.",
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 85,
  defense: 78,
  tier: 11,
  rangeType: EntityAttackType.Melee,
  basePrice: 130,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 130,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 7,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel strength flowing through your body. (+7% strength)",
          deactivation: "You feel strength leaving your body. (-7% strength)",
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
      trait: BasicAttribute.MagicResistance,
      buffPercentage: 6,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of magicResistance flowing through your body. (+6% magicResistance)",
          deactivation: "You feel the power of magicResistance leaving your body. (-6% magicResistance)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 7%, dagger by 6% and magicResistance by 6% respectively",
};
