import { ICraftableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { CraftingResourcesBlueprint } from "../../types/itemsBlueprintTypes";

export const itemPrimordialRelic: ICraftableItemBlueprint = {
  key: CraftingResourcesBlueprint.PrimordialRelic,
  type: ItemType.CraftingResource,
  subType: ItemSubType.CraftingResource,
  textureAtlas: "items",
  texturePath: "crafting-resources/primordial-relic.png",
  name: "Primordial Relic",
  description: "A relic from the ancient times.",
  weight: 0.01,
  maxStackSize: 999,
  basePrice: 10000,
};
