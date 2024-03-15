import { ToolsBlueprint } from "../../types/itemsBlueprintTypes";
import { itemButchersKnife } from "./ItemButchersKnife";
import { itemCarpentersAxe } from "./ItemCarpentersAxe";
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
  [ToolsBlueprint.FishingRod]: itemFishingRod,
  [ToolsBlueprint.Pickaxe]: itemPickaxe,
  [ToolsBlueprint.Hammer]: itemHammer,
  [ToolsBlueprint.UseWithTileTest]: itemUseWithTileTest, //! UNIT TEST ONLY
  [ToolsBlueprint.Scythe]: itemScythe,
  [ToolsBlueprint.WateringCan]: itemWateringCan,
  [ToolsBlueprint.MoonlureFishingRod]: itemMoonlureFishingRod,
};
