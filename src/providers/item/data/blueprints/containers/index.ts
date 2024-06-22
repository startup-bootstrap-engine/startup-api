import { ContainersBlueprint } from "../../types/itemsBlueprintTypes";
import { itemAzureBackpack } from "./ItemAzureBackpack";
import { itemBackpack } from "./ItemBackpack";
import { itemBag } from "./ItemBag";
import { itemCrimsonBackpack } from "./ItemCrimsonBackpack";
import { itemEmeraldBackpack } from "./ItemEmeraldBackpack";
import { itemHuntersBackpack } from "./ItemHuntersBackpack";
import { itemPouch } from "./ItemPouch";

export const containersBlueprintIndex = {
  [ContainersBlueprint.Bag]: itemBag,
  [ContainersBlueprint.Backpack]: itemBackpack,
  [ContainersBlueprint.AzureBackpack]: itemAzureBackpack,
  [ContainersBlueprint.EmeraldBackpack]: itemEmeraldBackpack,
  [ContainersBlueprint.CrimsonBackpack]: itemCrimsonBackpack,
  [ContainersBlueprint.HuntersBackpack]: itemHuntersBackpack,
  [ContainersBlueprint.Pouch]: itemPouch,
};
