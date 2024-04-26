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

export const itemAurumAlloyPickaxe: IToolItemBlueprint = {
  key: ToolsBlueprint.AurumAlloyPickaxe,
  type: ItemType.Tool,
  subType: ItemSubType.Tool,
  toolCategory: ToolsBlueprint.Pickaxe,
  textureAtlas: "items",
  texturePath: "tools/aurum-alloy-pickaxe.png",
  name: "Aurum Alloy Pickaxe",
  description: "A pickaxe that can mine iron, copper and silver ores.",
  attack: 8,
  defense: 3,
  weight: 0.1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 12500,
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
        "Seems like there's nothing valuable here.",
        "Unfortunately, no ores found with the Aurum Alloy Pickaxe.",
        "The rare blend of metals didn't reveal any ores this time.",
      ],
      successMessages: [
        "Your Aurum Alloy Pickaxe has unearthed a variety of ores including golden and iron!",
        "Success! The Aurum Alloy Pickaxe has proven its worth with a rich haul of ores, including golden and iron.",
        "You've struck it rich with your Aurum Alloy Pickaxe, extracting both golden and iron ores!",
      ],
      rewards: [
        {
          key: RangedWeaponsBlueprint.Stone,
          qty: [1, 2],
          chance: await itemCraftable.getCraftChance(character, CraftingSkill.Mining, 4, rarityOfTool),
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
              chance: await itemCraftable.getCraftChance(character, CraftingSkill.Mining, 5, rarityOfTool),
            },
          ] as IUseWithItemToTileReward[],
        };
        break;
    }

    await useWithItemToTile.execute(character, useWithItemToTileOptions, skillIncrease);
  },
  usableEffectDescription: "Use it on iron, copper, silver ores to mine them",
};
