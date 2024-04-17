import { ICraftableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { CraftingResourcesBlueprint } from "../../types/itemsBlueprintTypes";

export const itemDuskwispHerbFlower: ICraftableItemBlueprint = {
  key: CraftingResourcesBlueprint.DuskwispHerbFlower,
  type: ItemType.CraftingResource,
  subType: ItemSubType.CraftingResource,
  textureAtlas: "items",
  texturePath: "crafting-resources/duskwisp-herb.png",
  name: "Duskwisp Herb Flower",
  description: "Gathered shimmering leaves offer tranquility-infused essence, essential for enchanting mana potions.",
  weight: 0.01,
  maxStackSize: 999,
  basePrice: 15,
};
