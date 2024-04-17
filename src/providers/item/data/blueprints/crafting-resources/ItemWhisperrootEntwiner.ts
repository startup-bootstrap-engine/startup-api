import { ICraftableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { CraftingResourcesBlueprint } from "../../types/itemsBlueprintTypes";

export const itemWhisperrootEntwiner: ICraftableItemBlueprint = {
  key: CraftingResourcesBlueprint.WhisperrootEntwiner,
  type: ItemType.CraftingResource,
  subType: ItemSubType.CraftingResource,
  textureAtlas: "items",
  texturePath: "crafting-resources/whisperroot-entwiner.png",
  name: "Whisperroot Entwiner",
  description: "A crafting resource used for making magic items.",
  weight: 0.01,
  maxStackSize: 999,
  basePrice: 300,
};
