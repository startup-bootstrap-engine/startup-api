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

export const itemWoodsManAxe: IToolItemBlueprint = {
  key: ToolsBlueprint.WoodsManAxe,
  type: ItemType.Tool,
  subType: ItemSubType.Tool,
  toolCategory: ToolsBlueprint.CarpentersAxe,
  textureAtlas: "items",
  texturePath: "tools/woods-man-axe.png",
  name: "Wood's Man Axe",
  description: "A versatile and well-balanced axe, the woodsman's trusted companion for all manner of forestry tasks.",
  attack: 10,
  defense: 4,
  weight: 0.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 160,
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
          "Not the right tool for this job.",
          "The Woodsman is a versatile tool, but even it has limits",
          "Hmm, looks like you need a different approach.",
        ],
        successMessages: ["Your aim is true, woodsman!", "Another one bites the dust.", "Steady and efficient work."],
        rewards: [
          {
            key: CraftingResourcesBlueprint.GreaterWoodenLog,
            qty: [4, 5],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Lumberjacking, 10, rarityOfTool),
          },
          {
            key: CraftingResourcesBlueprint.WoodenSticks,
            qty: [3, 4],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Lumberjacking, 15, rarityOfTool),
          },
          {
            key: CraftingResourcesBlueprint.SmallWoodenStick,
            qty: [3, 4],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Lumberjacking, 15, rarityOfTool),
          },
          {
            key: CraftingResourcesBlueprint.ElvenWood,
            qty: [1, 2],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Lumberjacking, 5, rarityOfTool),
          },
          {
            key: CraftingResourcesBlueprint.WhisperrootEntwiner,
            qty: [3, 7],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Lumberjacking, 2, rarityOfTool),
          },
        ],
      },
      skillIncrease
    );
  },
  usableEffectDescription:
    "Use this tool to gather wooden sticks, small wooden sticks, elven wood, and greater wooden logs.",
};
