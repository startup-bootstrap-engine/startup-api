import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { container } from "@providers/inversify/container";
import { ItemCraftable } from "@providers/item/ItemCraftable";
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

export const itemPickaxe: IToolItemBlueprint = {
  key: ToolsBlueprint.Pickaxe,
  type: ItemType.Tool,
  subType: ItemSubType.Tool,
  textureAtlas: "items",
  texturePath: "tools/pickaxe.png",
  name: "Pickaxe",
  description: "A tool used for mining iron and copper ores.",
  attack: 4,
  defense: 2,
  weight: 0.1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 60,
  hasUseWith: true,
  canSell: false,
  useWithMaxDistanceGrid: RangeTypes.UltraShort,
  useWithTileEffect: async (
    originItem: IItem,
    targetTile: IUseWithTargetTile,
    targetName: string | undefined,
    character: ICharacter,
    itemCraftable: ItemCraftable,
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
          qty: [3, 5],
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
              qty: [5, 7],
              chance: await itemCraftable.getCraftChance(character, CraftingSkill.Mining, 10, rarityOfTool),
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
              chance: await itemCraftable.getCraftChance(character, CraftingSkill.Mining, 5, rarityOfTool),
            },
          ] as IUseWithItemToTileReward[],
        };
        break;
    }

    await useWithItemToTile.execute(character, useWithItemToTileOptions, skillIncrease);
  },
  usableEffectDescription: "Use this tool to mine ores.",
};
