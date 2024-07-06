import { ICraftableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { CraftingResourcesBlueprint } from "../../types/itemsBlueprintTypes";

export const itemGreenOre: ICraftableItemBlueprint = {
  key: CraftingResourcesBlueprint.GreenOre,
  type: ItemType.CraftingResource,
  subType: ItemSubType.CraftingResource,
  textureAtlas: "items",
  texturePath: "crafting-resources/green-ore.png",
  name: "Green Ore",
  description:
    "Green ore that can be smelted into ingots. To do this, click on a hammer, select 'Use with...' and then click on an anvil or furnace with this item in your inventory.",
  weight: 1.4,
  maxStackSize: 999,
  basePrice: 30,
  canSell: false,
};
