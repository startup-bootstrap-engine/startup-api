import { ICraftableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { CraftingResourcesBlueprint } from "../../types/itemsBlueprintTypes";

export const itemSocialCrystal: ICraftableItemBlueprint = {
  key: CraftingResourcesBlueprint.SocialCrystal,
  type: ItemType.CraftingResource,
  subType: ItemSubType.CraftingResource,
  textureAtlas: "items",
  texturePath: "crafting-resources/tile049.png",
  name: "Social Crystal",
  description:
    "A crystal that's earned for bringing more people to Definya's world. Click on the 'Colored Diamond' button to get started.",
  weight: 0.01,
  maxStackSize: 999,
  basePrice: 50,
  canSell: false,
};
