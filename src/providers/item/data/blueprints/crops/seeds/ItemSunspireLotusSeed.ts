import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { FARMING_SEED_PRICE_RATIO } from "@providers/constants/FarmingConstants";
import { container } from "@providers/inversify/container";
import { ItemCraftable } from "@providers/item/ItemCraftable";
import { SeedsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { IUseWithItemToSeedOptions, UseWithItemToSeed } from "@providers/useWith/abstractions/UseWithItemToSeed";
import { IUseWithTargetSeed } from "@providers/useWith/useWithTypes";
import {
  CraftingSkill,
  EntityAttackType,
  IUseWithItemBlueprint,
  ItemSubType,
  ItemType,
  RangeTypes,
} from "@rpg-engine/shared";

export const itemSunspireLotusSeed: IUseWithItemBlueprint = {
  key: SeedsBlueprint.SunspireLotusSeed,
  type: ItemType.Other,
  subType: ItemSubType.Seed,
  maxStackSize: 999,
  textureAtlas: "items",
  texturePath: "farm/seed-packs/seed-pack-brown.png",
  name: "Sunspire Lotus Seed",
  description: "A small seed that grows into a sunspire lotus seed. It requires fertile soil and enough water to grow.",
  weight: 0.01,
  hasUseWith: true,
  basePrice: 60 * FARMING_SEED_PRICE_RATIO,
  rangeType: EntityAttackType.None,
  useWithMaxDistanceGrid: RangeTypes.Short,
  canSell: true,
  useWithTileEffect: async (
    originItemKey: string,
    targetTile: IUseWithTargetSeed,
    targetName: string,
    character: ICharacter,
    itemCraftable: ItemCraftable,
    skillIncrease: SkillIncrease
  ): Promise<void> => {
    const useWithItemToSeed = container.get<UseWithItemToSeed>(UseWithItemToSeed);

    const options: IUseWithItemToSeedOptions = {
      map: targetTile.map,
      coordinates: targetTile.coordinates,
      key: targetName,
      originItemKey,
      successMessage: "Planting Success",
      errorMessage: "Planting Failed!",
    };

    await useWithItemToSeed.execute(character, options, skillIncrease);
  },
  usableEffectDescription: "Use it on a fertile soil to plant a cabbage",
  minRequirements: {
    level: 8,
    skill: {
      name: CraftingSkill.Farming,
      level: 15,
    },
  },
};
