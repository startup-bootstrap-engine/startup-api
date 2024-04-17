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

export const itemGildedLavaPickaxe: IToolItemBlueprint = {
  key: ToolsBlueprint.GildedLavaPickaxe,
  type: ItemType.Tool,
  subType: ItemSubType.Tool,
  toolCategory: ToolsBlueprint.Pickaxe,
  textureAtlas: "items",
  texturePath: "tools/gilded-lava-pickaxe.png",
  name: "Gilded Lava Pickaxe",
  description: "A powerful pickaxe made of gilded lava.",
  attack: 10,
  defense: 6,
  weight: 0.1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 150,
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
        "Hmm... Nothing here.",
        "You effort is in vain.",
        "You can't find anything.",
        "Maybe you should try somewhere else.",
        "Mining is hard work! Nothing here!",
      ],
      successMessages: [
        "You found some ore!",
        "Wow! You got some ore!",
        "You found some ore! You can smelt it into ingot bars.",
      ],
      rewards: [
        {
          key: RangedWeaponsBlueprint.Stone,
          qty: [2, 3],
          chance: await itemCraftable.getCraftChance(character, CraftingSkill.Mining, 10, rarityOfTool),
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
              chance: await itemCraftable.getCraftChance(character, CraftingSkill.Mining, 35, rarityOfTool),
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
              chance: await itemCraftable.getCraftChance(character, CraftingSkill.Mining, 25, rarityOfTool),
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
              chance: await itemCraftable.getCraftChance(character, CraftingSkill.Mining, 22, rarityOfTool),
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
              qty: [1, 2],
              chance: await itemCraftable.getCraftChance(character, CraftingSkill.Mining, 15, rarityOfTool),
            },
          ] as IUseWithItemToTileReward[],
        };
        break;

      case CraftingResourcesBlueprint.CorruptionOre:
        useWithItemToTileOptions = {
          ...baseUseWithItemToTileOptions,
          rewards: [
            ...baseUseWithItemToTileOptions.rewards,
            {
              key: CraftingResourcesBlueprint.CorruptionOre,
              qty: [1, 2],
              chance: await itemCraftable.getCraftChance(character, CraftingSkill.Mining, 10, rarityOfTool),
            },
          ] as IUseWithItemToTileReward[],
        };
        break;

      case CraftingResourcesBlueprint.GreenOre:
        useWithItemToTileOptions = {
          ...baseUseWithItemToTileOptions,
          rewards: [
            ...baseUseWithItemToTileOptions.rewards,
            {
              key: CraftingResourcesBlueprint.GreenOre,
              qty: [2, 3],
              chance: await itemCraftable.getCraftChance(character, CraftingSkill.Mining, 8, rarityOfTool),
            },
          ] as IUseWithItemToTileReward[],
        };
        break;

      case CraftingResourcesBlueprint.ObsidiumOre:
        useWithItemToTileOptions = {
          ...baseUseWithItemToTileOptions,
          rewards: [
            ...baseUseWithItemToTileOptions.rewards,
            {
              key: CraftingResourcesBlueprint.ObsidiumOre,
              qty: [2, 3],
              chance: await itemCraftable.getCraftChance(character, CraftingSkill.Mining, 5, rarityOfTool),
            },
          ] as IUseWithItemToTileReward[],
        };
        break;
    }

    await useWithItemToTile.execute(character, useWithItemToTileOptions, skillIncrease);
  },
  usableEffectDescription: "Use it on iron, copper, silver, golden, corruption, green ores to mine them",
};
