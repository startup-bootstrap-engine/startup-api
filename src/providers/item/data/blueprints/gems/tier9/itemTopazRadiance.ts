import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { IItemGemTier9Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { UseWithGem } from "@providers/useWith/abstractions/UseWithGem";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  CombatSkill,
  EntityAttackType,
  ItemSubType,
  ItemType,
  RangeTypes,
} from "@rpg-engine/shared";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemTopazRadiance: IItemGemTier9Blueprint = {
  key: GemsBlueprint.TopazRadiance,
  type: ItemType.Tool,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/topaz-radiance.png",
  name: "Topaz Radiance Gem",
  description: "Shiny gold gem, clear and bright, like a sunny spark in a picture.",
  hasUseWith: true,
  useWithMaxDistanceGrid: RangeTypes.Medium,
  weight: 1,
  basePrice: 100000,
  canSell: false,
  rangeType: EntityAttackType.None,
  tier: 9,
  gemStatBuff: {
    attack: 70,
    defense: 70,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.Corruption],
  gemEntityEffectChance: 75,
  usableEffectDescription:
    "+70 Attack, +70 Defense, 75% chance to apply Corruption effect each hit. Buff: +15% Magic Resistance, +15% Magic. 15% in all combat skills.",

  gemEquippedBuffAdd: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.MagicResistance,
      buffPercentage: 15,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 15,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Axe,
      buffPercentage: 15,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Club,
      buffPercentage: 15,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Sword,
      buffPercentage: 15,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Distance,
      buffPercentage: 15,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Dagger,
      buffPercentage: 15,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
};
