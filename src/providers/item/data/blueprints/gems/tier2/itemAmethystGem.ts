import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { IItemGemTier2Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemAmethystGem: IItemGemTier2Blueprint = {
  key: GemsBlueprint.AmethystGem,
  type: ItemType.Tool,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/amethyst-gem.png",
  name: "Amethyst Gem",
  description:
    "When attached to a weapon, it increases the attack and defense of the wielder. It also has a chance to apply the Poison effect on each hit.",
  hasUseWith: true,
  useWithMaxDistanceGrid: RangeTypes.Medium,
  weight: 1.5,
  basePrice: 22000,
  canSell: false,
  rangeType: EntityAttackType.None,
  tier: 2,
  gemStatBuff: {
    attack: 22,
    defense: 20,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.Poison],
  gemEntityEffectChance: 20,
  usableEffectDescription:
    "+22 Attack, +20 Defense, 20% chance to apply Poison effect each hit. Buff: +4% Resistance, +3% Magic Resistance, +6% Magic.",

  gemEquippedBuffAdd: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 4,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.AmethystGem,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.MagicResistance,
      buffPercentage: 3,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.AmethystGem,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 6,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.AmethystGem,
    },
  ],

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
};