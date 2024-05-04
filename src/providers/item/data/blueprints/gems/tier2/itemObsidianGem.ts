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

export const itemObsidianGem: IItemGem = {
  key: GemsBlueprint.ObsidianGem,
  type: ItemType.Tool,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/obsidian-gem.png",
  name: "Obsidian Gem",
  description: "Dark mystery, sleek elegance, a formidable beauty; harness the strength and allure of obsidian.",
  hasUseWith: true,
  useWithMaxDistanceGrid: RangeTypes.Medium,
  weight: 1.5,
  basePrice: 700,
  canSell: false,
  rangeType: EntityAttackType.None,
  gemStatBuff: {
    attack: 17,
    defense: 15,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.Corruption],
  gemEntityEffectChance: 80,

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
  gemEquippedBuffAdd: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Resistance,
    buffPercentage: 12,
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
