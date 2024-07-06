import { ICraftableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { CraftingResourcesBlueprint } from "../../types/itemsBlueprintTypes";

export const itemSilverOre: ICraftableItemBlueprint = {
  key: CraftingResourcesBlueprint.SilverOre,
  type: ItemType.CraftingResource,
  subType: ItemSubType.CraftingResource,
  textureAtlas: "items",
  texturePath: "crafting-resources/silver-ore.png",
  name: "Silver Ore",
  description:
    "Silver ore that can be smelted into ingots. To do this, click on a hammer, select 'Use with...' and then click on an anvil or furnace with this item in your inventory.",
  weight: 1.6,
  maxStackSize: 999,
  canSell: false,
  basePrice: 35,
};
