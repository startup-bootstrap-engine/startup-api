import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { UseWithGem } from "@providers/useWith/abstractions/UseWithGem";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  IItemGem,
  ItemSubType,
  ItemType,
  RangeTypes,
} from "@rpg-engine/shared";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemJasperGem: IItemGem = {
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
  basePrice: 550,
  canSell: false,
  rangeType: EntityAttackType.None,
  gemStatBuff: {
    attack: 15,
    defense: 12,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.Bleeding],
  gemEntityEffectChance: 80,

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
  gemEquippedBuffAdd: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Strength,
    buffPercentage: 10,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the strength and fortitude coursing through your body. (+10% strength)",
        deactivation: "You feel the strength and fortitude coursing leaving through your body. (-10% strength)",
      },
    },
  },
  equippedBuffDescription: "Increases strength by 10%",
};
