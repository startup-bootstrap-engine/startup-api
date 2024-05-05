import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { IItemGemTier5Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemJasperGem: IItemGemTier5Blueprint = {
  key: GemsBlueprint.JasperGem,
  type: ItemType.Tool,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/jasper-gem.png",
  name: "Jasper Gem",
  description: "Rustic allure, nature's palette, a mystical touch; embody the essence of adventure.",
  hasUseWith: true,
  useWithMaxDistanceGrid: RangeTypes.Medium,
  weight: 1,
  basePrice: 54000,
  canSell: false,
  rangeType: EntityAttackType.None,
  tier: 5,
  gemStatBuff: {
    attack: 41,
    defense: 42,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.Bleeding],
  gemEntityEffectChance: 44,
  usableEffectDescription:
    "+41 Attack, +42 Defense, 44% chance to apply Bleeding effect each hit. Buff: +10% Strength, +10% Magic.",

  gemEquippedBuffAdd: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.JasperGem,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.JasperGem,
    },
  ],
  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
};
