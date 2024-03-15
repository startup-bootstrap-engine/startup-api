import { ToolsBlueprint } from "../../types/itemsBlueprintTypes";
import { itemButchersKnife } from "./ItemButchersKnife";
import { itemCarpentersAxe } from "./ItemCarpentersAxe";
import { itemCrimsonWateringCan } from "./ItemCrimsonWateringCan";
import { itemFishingRod } from "./ItemFishingRod";
import { itemHammer } from "./ItemHammer";
import { itemMoonlureFishingRod } from "./ItemMoonlureFishingRod";
import { itemPickaxe } from "./ItemPickaxe";
import { itemScythe } from "./ItemScythe";
import { itemUseWithTileTest } from "./ItemUseWithTileTest";
import { itemWateringCan } from "./ItemWateringCan";

export const toolsBlueprintIndex = {
  [ToolsBlueprint.ButchersKnife]: itemButchersKnife,
  [ToolsBlueprint.CarpentersAxe]: itemCarpentersAxe,
  [ToolsBlueprint.Pickaxe]: itemPickaxe,
  [ToolsBlueprint.Hammer]: itemHammer,
  [ToolsBlueprint.UseWithTileTest]: itemUseWithTileTest, //! UNIT TEST ONLY

  // Farming
  [ToolsBlueprint.Scythe]: itemScythe,
  [ToolsBlueprint.WateringCan]: itemWateringCan,
  [ToolsBlueprint.CrimsonWateringCan]: itemCrimsonWateringCan,

  // Fishing rods
  [ToolsBlueprint.FishingRod]: itemFishingRod,
  [ToolsBlueprint.MoonlureFishingRod]: itemMoonlureFishingRod,
};
