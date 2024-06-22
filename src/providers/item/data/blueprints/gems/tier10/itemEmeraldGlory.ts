import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { IItemGemTier10Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemEmeraldGlory: IItemGemTier10Blueprint = {
  key: GemsBlueprint.EmeraldGlory,
  type: ItemType.Tool,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/emerald-glory.png",
  name: "Emerald Glory Gem",
  description: "A radiant green gem, shimmering with the power of nature and life.",
  hasUseWith: true,
  useWithMaxDistanceGrid: RangeTypes.High,
  weight: 1.2,
  basePrice: 108000,
  canSell: false,
  rangeType: EntityAttackType.None,
  tier: 10,
  gemStatBuff: {
    attack: 78,
    defense: 76,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.Corruption],
  gemEntityEffectChance: 85,
  usableEffectDescription:
    "+78 Attack, +76 Defense, 85% chance to apply Corruption effect each hit. Buff: +20% Magic Resistance, +20% Magic. 20% in all combat skills.",

  gemEquippedBuffAdd: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.MagicResistance,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.EmeraldGlory,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.EmeraldGlory,
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Axe,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.EmeraldGlory,
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Club,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.EmeraldGlory,
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Sword,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.EmeraldGlory,
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Distance,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.EmeraldGlory,
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Dagger,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.EmeraldGlory,
    },
  ],

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
};
