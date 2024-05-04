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

export const itemAmethystGem: IItemGem = {
  key: GemsBlueprint.AmethystGem,
  type: ItemType.Tool,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/amethyst-gem.png",
  name: "Amethyst Gem",
  description: "Royal purple charm, soothing clarity; a regal and enchanting beauty within this precious stone.",
  hasUseWith: true,
  useWithMaxDistanceGrid: RangeTypes.Medium,
  weight: 1.5,
  basePrice: 800,
  canSell: false,
  rangeType: EntityAttackType.None,
  gemStatBuff: {
    attack: 20,
    defense: 18,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.Poison],
  gemEntityEffectChance: 90,

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
  gemEquippedBuffAdd: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Strength,
    buffPercentage: 15,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the strength and fortitude coursing through your body. (+15% strength)",
        deactivation: "You feel the strength and fortitude coursing leaving through your body. (-15% strength)",
      },
    },
  },
  equippedBuffDescription: "Increases strength by 15%",
};
