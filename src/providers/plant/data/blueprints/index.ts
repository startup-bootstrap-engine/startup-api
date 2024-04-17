import { PlantItemBlueprint } from "../types/PlantTypes";
import { plantItemBloodrootBlossom } from "./PlantItemBloodrootBlossom";
import { plantItemCabbage } from "./PlantItemCabbage";
import { plantItemCarrot } from "./PlantItemCarrot";
import { plantItemDuskwispHerb } from "./PlantItemDuskwispHerb";
import { plantItemEggPlant } from "./PlantItemEggPlant";
import { plantItemGreenGrape } from "./PlantItemGreenGrape";
import { plantItemPotato } from "./PlantItemPotato";
import { plantItemPumpkin } from "./PlantItemPumpkin";
import { plantItemRedGrape } from "./PlantItemRedGrape";
import { plantItemStrawberry } from "./PlantItemStrawberry";
import { plantItemSunspireLotus } from "./PlantItemSunspireLotus";
import { plantItemTomato } from "./PlantItemTomato";
import { plantItemTurnip } from "./PlantItemTurnip";
import { plantItemWatermelon } from "./PlantItemWatermelon";

export const plantsBlueprints = {
  [PlantItemBlueprint.Cabbage]: plantItemCabbage,
  [PlantItemBlueprint.Carrot]: plantItemCarrot,
  [PlantItemBlueprint.Eggplant]: plantItemEggPlant,
  [PlantItemBlueprint.GreenGrape]: plantItemGreenGrape,
  [PlantItemBlueprint.Potato]: plantItemPotato,
  [PlantItemBlueprint.Pumpkin]: plantItemPumpkin,
  [PlantItemBlueprint.RedGrape]: plantItemRedGrape,
  [PlantItemBlueprint.Strawberry]: plantItemStrawberry,
  [PlantItemBlueprint.Tomato]: plantItemTomato,
  [PlantItemBlueprint.Turnip]: plantItemTurnip,
  [PlantItemBlueprint.Watermelon]: plantItemWatermelon,
  [PlantItemBlueprint.BloodrootBlossom]: plantItemBloodrootBlossom,
  [PlantItemBlueprint.DuskwispHerb]: plantItemDuskwispHerb,
  [PlantItemBlueprint.SunspireLotus]: plantItemSunspireLotus,
};
