import { ICraftableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { CraftingResourcesBlueprint } from "../../types/itemsBlueprintTypes";

export const itemObsidiumOre: ICraftableItemBlueprint = {
  key: CraftingResourcesBlueprint.ObsidiumOre,
  type: ItemType.CraftingResource,
  subType: ItemSubType.CraftingResource,
  textureAtlas: "items",
  texturePath: "crafting-resources/obsidium-ore.png",
  name: "Obsidium Ore",
  description:
    "Obsidium ore that can be smelted into ingots. To do this, click on a hammer, select 'Use with...' and then click on an anvil or furnace with this item in your inventory.",
  weight: 0.5,
  maxStackSize: 999,
  basePrice: 50,
  canSell: false,
};
