import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { container } from "@providers/inversify/container";
import { ItemCraftableQueue } from "@providers/item/ItemCraftableQueue";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import {
  IUseWithItemToTileOptions,
  IUseWithItemToTileReward,
  UseWithItemToTile,
} from "@providers/useWith/abstractions/UseWithItemToTile";
import { IUseWithTargetTile } from "@providers/useWith/useWithTypes";
import {
  CraftingSkill,
  IToolItemBlueprint,
  ItemRarities,
  ItemSlotType,
  ItemSubType,
  ItemType,
  RangeTypes,
} from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { CraftingResourcesBlueprint, RangedWeaponsBlueprint, ToolsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemEmberEdgePickaxe: IToolItemBlueprint = {
  key: ToolsBlueprint.EmberEdgePickaxe,
  type: ItemType.Tool,
  subType: ItemSubType.Tool,
  toolCategory: ToolsBlueprint.Pickaxe,
  textureAtlas: "items",
  texturePath: "tools/ember-edge-pickaxe.png",
  name: "Ember Edge Pickaxe",
  description: "A pickaxe that can mine copper and golden ores.",
  attack: 6,
  defense: 4,
  weight: 0.1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 80,
  hasUseWith: true,
  canSell: false,
  useWithMaxDistanceGrid: RangeTypes.UltraShort,
  useWithTileEffect: async (
    originItem: IItem,
    targetTile: IUseWithTargetTile,
    targetName: string | undefined,
    character: ICharacter,
    itemCraftable: ItemCraftableQueue,
    skillIncrease: SkillIncrease
  ) => {
    const useWithItemToTile = container.get<UseWithItemToTile>(UseWithItemToTile);
    const rarityOfTool = originItem.rarity ?? ItemRarities.Common;

    const baseUseWithItemToTileOptions: IUseWithItemToTileOptions = {
      targetTile,
      targetTileAnimationEffectKey: "mining",
      errorMessages: [
        "No ores found in these molten depths.",
        "Seems like the molten depths are barren of ores.",
        "Unfortunately, no treasures lie beneath the molten surface.",
      ],
      successMessages: [
        "You've uncovered valuable copper and golden ores!",
        "Your efforts in the molten depths have paid off with both copper and golden ores!",
        "Success! Your Ember Edge Pickaxe has unearthed a rich vein of copper and golden ores.",
      ],
      rewards: [
        {
          key: RangedWeaponsBlueprint.Stone,
          qty: [1, 2],
          chance: await itemCraftable.getCraftChance(character, CraftingSkill.Mining, 5, rarityOfTool),
        },
      ],
    };

    let useWithItemToTileOptions: IUseWithItemToTileOptions = baseUseWithItemToTileOptions;

    switch (targetName) {
      case CraftingResourcesBlueprint.IronOre:
        useWithItemToTileOptions = {
          ...baseUseWithItemToTileOptions,
          rewards: [
            ...baseUseWithItemToTileOptions.rewards,
            {
              key: CraftingResourcesBlueprint.IronOre,
              qty: [3, 5],
              chance: await itemCraftable.getCraftChance(character, CraftingSkill.Mining, 15, rarityOfTool),
            },
          ] as IUseWithItemToTileReward[],
        };
        break;
      case CraftingResourcesBlueprint.CopperOre:
        useWithItemToTileOptions = {
          ...baseUseWithItemToTileOptions,
          rewards: [
            ...baseUseWithItemToTileOptions.rewards,
            {
              key: CraftingResourcesBlueprint.CopperOre,
              qty: [3, 4],
              chance: await itemCraftable.getCraftChance(character, CraftingSkill.Mining, 10, rarityOfTool),
            },
          ] as IUseWithItemToTileReward[],
        };
        break;

      case CraftingResourcesBlueprint.SilverOre:
        useWithItemToTileOptions = {
          ...baseUseWithItemToTileOptions,
          rewards: [
            ...baseUseWithItemToTileOptions.rewards,
            {
              key: CraftingResourcesBlueprint.SilverOre,
              qty: [2, 3],
              chance: await itemCraftable.getCraftChance(character, CraftingSkill.Mining, 12, rarityOfTool),
            },
          ] as IUseWithItemToTileReward[],
        };
        break;

      case CraftingResourcesBlueprint.GoldenOre:
        useWithItemToTileOptions = {
          ...baseUseWithItemToTileOptions,
          rewards: [
            ...baseUseWithItemToTileOptions.rewards,
            {
              key: CraftingResourcesBlueprint.GoldenOre,
              qty: [3, 4],
              chance: await itemCraftable.getCraftChance(character, CraftingSkill.Mining, 8, rarityOfTool),
            },
          ] as IUseWithItemToTileReward[],
        };
        break;
    }

    await useWithItemToTile.execute(character, useWithItemToTileOptions, skillIncrease);
  },
  usableEffectDescription: "Use it on iron, copper, silver, golden ores to mine them",
};
