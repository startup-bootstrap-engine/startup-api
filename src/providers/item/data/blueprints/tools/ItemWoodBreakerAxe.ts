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

export const itemWoodBreakerAxe: IToolItemBlueprint = {
  key: ToolsBlueprint.WoodBreakerAxe,
  type: ItemType.Tool,
  subType: ItemSubType.Tool,
  toolCategory: ToolsBlueprint.CarpentersAxe,
  textureAtlas: "items",
  texturePath: "tools/wood-breaker-axe.png",
  name: "Wood Breaker's Axe",
  description: "A tool used for gathering wooden sticks, small wooden sticks, elven wood, and greater wooden logs.",
  attack: 8,
  defense: 2,
  weight: 0.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 130,
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
          "This tree is too puny for the Woodbreaker!",
          "You'll need something stronger for this beast of a tree.",
          "Ouch! That almost bounced back at you.",
        ],
        successMessages: [
          "Timberrrr!",
          "The Woodbreaker laughs at this challenge!",
          "The forest trembles before your might.",
        ],
        rewards: [
          {
            key: CraftingResourcesBlueprint.WoodenSticks,
            qty: [2, 3],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Lumberjacking, 30, rarityOfTool),
          },
          {
            key: CraftingResourcesBlueprint.SmallWoodenStick,
            qty: [2, 3],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Lumberjacking, 30, rarityOfTool),
          },

          {
            key: CraftingResourcesBlueprint.ElvenWood,
            qty: [2, 3],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Lumberjacking, 20, rarityOfTool),
          },
          {
            key: CraftingResourcesBlueprint.GreaterWoodenLog,
            qty: [5, 10],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Lumberjacking, 15, rarityOfTool),
          },
          {
            key: CraftingResourcesBlueprint.WhisperrootEntwiner,
            qty: [1, 2],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Lumberjacking, 5, rarityOfTool),
          },
        ],
      },
      skillIncrease
    );
  },
  usableEffectDescription:
    "Use this tool on a felled tree to gather wooden sticks, small wooden sticks, elven wood, and greater wooden logs.",
};
