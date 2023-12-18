import { ICraftableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { CraftingResourcesBlueprint } from "../../types/itemsBlueprintTypes";

export const itemJade: ICraftableItemBlueprint = {
  key: CraftingResourcesBlueprint.Jade,
  type: ItemType.CraftingResource,
  subType: ItemSubType.CraftingResource,
  textureAtlas: "items",
  texturePath: "crafting-resources/jade.png",
  name: "Jade",
  description: "A piece of jade. The eye of Dursed Dragon.",
  weight: 0.01,
  maxStackSize: 999,
  basePrice: 20,
};
