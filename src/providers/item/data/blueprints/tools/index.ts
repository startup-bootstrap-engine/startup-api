import { ToolsBlueprint } from "../../types/itemsBlueprintTypes";
import { itemButchersKnife } from "./ItemButchersKnife";
import { itemCarpentersAxe } from "./ItemCarpentersAxe";
import { itemCrimsonWateringCan } from "./ItemCrimsonWateringCan";
import { itemElderHeartAxe } from "./ItemElderHeartAxe";
import { itemFishingRod } from "./ItemFishingRod";
import { itemHammer } from "./ItemHammer";
import { itemLogSplitterAxe } from "./ItemLogSplitterAxe";
import { itemMoonlureFishingRod } from "./ItemMoonlureFishingRod";
import { itemPickaxe } from "./ItemPickaxe";
import { itemScythe } from "./ItemScythe";
import { itemUseWithTileTest } from "./ItemUseWithTileTest";
import { itemWateringCan } from "./ItemWateringCan";
import { itemWoodBreakerAxe } from "./ItemWoodBreakerAxe";
import { itemWoodsManAxe } from "./ItemWoodsManAxe";

export const toolsBlueprintIndex = {
  [ToolsBlueprint.ButchersKnife]: itemButchersKnife,
  [ToolsBlueprint.CarpentersAxe]: itemCarpentersAxe,
  [ToolsBlueprint.ElderHeartAxe]: itemElderHeartAxe,
  [ToolsBlueprint.LogSplitterAxe]: itemLogSplitterAxe,
  [ToolsBlueprint.WoodBreakerAxe]: itemWoodBreakerAxe,
  [ToolsBlueprint.WoodsManAxe]: itemWoodsManAxe,
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
