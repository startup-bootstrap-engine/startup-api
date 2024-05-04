import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { IItemGemTier6Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { UseWithGem } from "@providers/useWith/abstractions/UseWithGem";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSubType,
  ItemType,
  RangeTypes,
} from "@rpg-engine/shared";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemMistyQuartzGem: IItemGemTier6Blueprint = {
  key: GemsBlueprint.MistyQuartzGem,
  type: ItemType.Tool,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/misty-quartz-gem.png",
  name: "Misty Quartz Gem",
  description: "Soft misty charm, subtle clarity; a serene and enchanting beauty in this unique gem.",
  hasUseWith: true,
  useWithMaxDistanceGrid: RangeTypes.Medium,
  weight: 1,
  tier: 6,
  basePrice: 62000,
  canSell: false,
  rangeType: EntityAttackType.None,
  gemStatBuff: {
    attack: 46,
    defense: 42,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.Freezing],
  gemEntityEffectChance: 50,
  usableEffectDescription:
    "+46 Attack, +42 Defense, 50% chance to apply Freezing effect each hit. Buff: +12% Magic Resistance, +12% Magic.",

  gemEquippedBuffAdd: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.MagicResistance,
      buffPercentage: 12,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 12,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
};
