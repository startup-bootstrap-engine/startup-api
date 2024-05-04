import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { IItemGemTier0Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemEmeraldGem: IItemGemTier0Blueprint = {
  key: GemsBlueprint.EmeraldGem,
  type: ItemType.Tool,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/emerald-gem.png",
  name: "Emerald Gem",
  description:
    "When attached to a weapon, it increases the attack and defense of the wielder. It also has a chance to apply the Poison effect on each hit",
  hasUseWith: true,
  useWithMaxDistanceGrid: RangeTypes.Medium,
  weight: 1.5,
  basePrice: 6000,
  canSell: false,
  rangeType: EntityAttackType.None,
  tier: 0,
  gemStatBuff: {
    attack: 5,
    defense: 4,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.Poison],
  gemEntityEffectChance: 8,
  usableEffectDescription:
    "+5 Attack, +4 Defense, 8% chance to apply Poison effect each hit. Buff:  +1% Resistance, +2% Strength.",

  gemEquippedBuffAdd: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 1,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 2,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
};
