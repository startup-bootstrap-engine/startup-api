import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { IItemGemTier4Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemEarthstoneGem: IItemGemTier4Blueprint = {
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
  basePrice: 42000,
  canSell: false,
  rangeType: EntityAttackType.None,
  tier: 4,
  gemStatBuff: {
    attack: 32,
    defense: 30,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.VineGrasp],
  gemEntityEffectChance: 40,
  usableEffectDescription:
    "+32 Attack, +30 Defense, 40% chance to apply Vine Grasp effect each hit. Buff: +8% Magic Resistance, +9% Magic, +6% Shielding.",

  gemEquippedBuffAdd: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.MagicResistance,
      buffPercentage: 8,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 9,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Shielding,
      buffPercentage: 6,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
};
