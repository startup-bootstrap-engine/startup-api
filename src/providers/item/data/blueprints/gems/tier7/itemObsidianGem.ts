import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { IItemGemTier7Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { UseWithGem } from "@providers/useWith/abstractions/UseWithGem";
import {
  CharacterBuffDurationType,
  CharacterBuffType,
  CombatSkill,
  EntityAttackType,
  ItemSubType,
  ItemType,
  RangeTypes,
} from "@rpg-engine/shared";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemObsidianGem: IItemGemTier7Blueprint = {
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
  tier: 7,
  basePrice: 72000,
  canSell: false,
  rangeType: EntityAttackType.None,
  gemStatBuff: {
    attack: 52,
    defense: 50,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.Corruption],
  gemEntityEffectChance: 58,
  usableEffectDescription:
    "+52 Attack, +50 Defense, 58% chance to apply Corruption effect each hit.  Buff: +10% to all combat skills.",

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
  gemEquippedBuffAdd: [
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Axe,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.ObsidianGem,
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Club,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.ObsidianGem,
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Sword,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.ObsidianGem,
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Distance,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.ObsidianGem,
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Dagger,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      isStackable: true,
      originateFrom: GemsBlueprint.ObsidianGem,
    },
  ],
};
