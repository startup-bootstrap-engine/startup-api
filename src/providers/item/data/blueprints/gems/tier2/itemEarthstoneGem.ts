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

export const itemEarthstoneGem: IItemGem = {
  key: GemsBlueprint.EarthstoneGem,
  type: ItemType.Tool,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/earthstone-gem.png",
  name: "Earthstone Gem",
  description: "Nature's embrace, earthly hues, timeless energy; a grounding and enchanting essence in gem form.",
  hasUseWith: true,
  useWithMaxDistanceGrid: RangeTypes.Medium,
  weight: 1.2,
  basePrice: 650,
  canSell: false,
  rangeType: EntityAttackType.None,
  gemStatBuff: {
    attack: 17,
    defense: 15,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.VineGrasp],
  gemEntityEffectChance: 80,

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
  gemEquippedBuffAdd: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Strength,
    buffPercentage: 5,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the strength and fortitude coursing through your body. (+5% strength)",
        deactivation: "You feel the strength and fortitude coursing leaving through your body. (-5% strength)",
      },
    },
  },
  equippedBuffDescription: "Increases strength by 5%",
};
