import { ICraftableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { CraftingResourcesBlueprint } from "../../types/itemsBlueprintTypes";

export const itemSunspireLotusFlower: ICraftableItemBlueprint = {
  key: CraftingResourcesBlueprint.SunspireLotusFlower,
  type: ItemType.CraftingResource,
  subType: ItemSubType.CraftingResource,
  textureAtlas: "items",
  texturePath: "crafting-resources/sunspire-lotus.png",
  name: "Sunspire Lotus Flower",
  description:
    "Each golden petal captures sunlight's vigor, a key component imbuing endurance potions with vitality and strength.",
  weight: 0.01,
  maxStackSize: 999,
  basePrice: 12,
};
