import { ICraftableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { CraftingResourcesBlueprint } from "../../types/itemsBlueprintTypes";

export const itemSewingThread: ICraftableItemBlueprint = {
  key: CraftingResourcesBlueprint.SewingThread,
  type: ItemType.CraftingResource,
  subType: ItemSubType.CraftingResource,
  textureAtlas: "items",
  texturePath: "crafting-resources/sewing-thread.png",
  name: "Sewing Thread",
  description: "A spool of simple Sewing Thread for crafts.",
  weight: 0.3,
  maxStackSize: 999,
  basePrice: 4,
};
