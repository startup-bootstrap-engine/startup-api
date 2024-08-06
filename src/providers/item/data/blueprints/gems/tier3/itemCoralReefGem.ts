import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { IItemGemTier3Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { UseWithGem } from "@providers/useWith/abstractions/UseWithGem";
import {
  CharacterBuffDurationType,
  CharacterBuffType,
  CombatSkill,
  EntityAttackType,
  ItemSubType,
  ItemType,
  RangeTypes,
  UserAccountTypes,
} from "@rpg-engine/shared";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemCoralReefGem: IItemGemTier3Blueprint = {
  key: GemsBlueprint.CoralReefGem,
  type: ItemType.Tool,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/coral-reef-gem.png",
  name: "Coral Reef Gem",
  description: "Tropical coral tones, vivid clarity; a vibrant and nature-inspired beauty in this unique gem.",
  hasUseWith: true,
  useWithMaxDistanceGrid: RangeTypes.Medium,
  weight: 1.5,
  tier: 3,
  basePrice: 34000,

  canSell: false,
  rangeType: EntityAttackType.None,
  gemStatBuff: {
    attack: 24,
    defense: 26,
  },
  canBePurchasedOnlyByPremiumPlans: [
    UserAccountTypes.PremiumSilver,
    UserAccountTypes.PremiumGold,
    UserAccountTypes.PremiumUltimate,
  ],
  gemEntityEffectsAdd: [EntityEffectBlueprint.Bleeding],
  gemEntityEffectChance: 25,
  usableEffectDescription:
    "+24 Attack, +26 Defense, 25% chance to apply Bleeding effect each hit. Buff: +5% to all combat skills.",

  gemEquippedBuffAdd: [
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Axe,
      buffPercentage: 5,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.CoralReefGem,
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Club,
      buffPercentage: 5,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.CoralReefGem,
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Sword,
      buffPercentage: 5,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.CoralReefGem,
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Distance,
      buffPercentage: 5,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.CoralReefGem,
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Dagger,
      buffPercentage: 5,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.CoralReefGem,
    },
  ],

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
};
