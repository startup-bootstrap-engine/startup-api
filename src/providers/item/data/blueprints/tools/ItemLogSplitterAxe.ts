import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { container } from "@providers/inversify/container";
import { ItemCraftableQueue } from "@providers/item/ItemCraftableQueue";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { UseWithItemToTile } from "@providers/useWith/abstractions/UseWithItemToTile";
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
import { CraftingResourcesBlueprint, ToolsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemLogSplitterAxe: IToolItemBlueprint = {
  key: ToolsBlueprint.LogSplitterAxe,
  type: ItemType.Tool,
  subType: ItemSubType.Tool,
  toolCategory: ToolsBlueprint.CarpentersAxe,
  textureAtlas: "items",
  texturePath: "tools/log-splitter-axe.png",
  name: "Log Splitter Axe",
  description: "A tool used for gathering wooden sticks, small wooden sticks, elven wood, and greater wooden logs.",
  attack: 8,
  defense: 4,
  weight: 0.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 60000,
  hasUseWith: true,
  useWithMaxDistanceGrid: RangeTypes.Short,
  canSell: false,
  useWithTileEffect: async (
    originItem: IItem,
    targetTile: IUseWithTargetTile,
    targetName: string,
    character: ICharacter,
    itemCraftable: ItemCraftableQueue,
    skillIncrease: SkillIncrease
  ): Promise<void> => {
    const useWithItemToTile = container.get<UseWithItemToTile>(UseWithItemToTile);
    const rarityOfTool = originItem.rarity ?? ItemRarities.Common;

    await useWithItemToTile.execute(
      character,
      {
        targetTile,
        targetTileAnimationEffectKey: "cutting-wood",
        errorMessages: [
          "You'll need to fell the tree first.",
          "This axe is for splitting, not chopping.",
          "Find a felled log to use this on.",
        ],
        successMessages: ["Perfect firewood!", "That split cleanly", "One swing, two logs."],
        rewards: [
          {
            key: CraftingResourcesBlueprint.WoodenSticks,
            qty: [2, 5],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Lumberjacking, 25, rarityOfTool),
          },
          {
            key: CraftingResourcesBlueprint.SmallWoodenStick,
            qty: [2, 5],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Lumberjacking, 25, rarityOfTool),
          },

          {
            key: CraftingResourcesBlueprint.ElvenWood,
            qty: [2, 8],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Lumberjacking, 15, rarityOfTool),
          },
          {
            key: CraftingResourcesBlueprint.GreaterWoodenLog,
            qty: [1, 6],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Lumberjacking, 10, rarityOfTool),
          },
        ],
      },
      skillIncrease
    );
  },
  usableEffectDescription:
    "Use this tool on a felled tree to gather wooden sticks, small wooden sticks, elven wood, and greater wooden logs.",
};
