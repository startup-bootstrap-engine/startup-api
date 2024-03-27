import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { container } from "@providers/inversify/container";
import { ItemCraftable } from "@providers/item/ItemCraftable";
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
  description: "Designed with a heavy wedge-shaped head, this axe splits felled logs with brutal efficiency.",
  attack: 8,
  defense: 4,
  weight: 0.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 120,
  hasUseWith: true,
  useWithMaxDistanceGrid: RangeTypes.Short,
  canSell: false,
  useWithTileEffect: async (
    originItem: IItem,
    targetTile: IUseWithTargetTile,
    targetName: string,
    character: ICharacter,
    itemCraftable: ItemCraftable,
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
            key: CraftingResourcesBlueprint.GreaterWoodenLog,
            qty: [1, 2],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Lumberjacking, 5, rarityOfTool),
          },
          {
            key: CraftingResourcesBlueprint.WoodenSticks,
            qty: [2, 3],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Lumberjacking, 12, rarityOfTool),
          },
          {
            key: CraftingResourcesBlueprint.SmallWoodenStick,
            qty: [4, 5],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Lumberjacking, 15, rarityOfTool),
          },
        ],
      },
      skillIncrease
    );
  },
  usableEffectDescription: "Use on felled logs to split them into usable lumber.",
};
