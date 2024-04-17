import { plantItemBloodrootBlossom } from "./blueprints/PlantItemBloodrootBlossom";
import { plantItemCabbage } from "./blueprints/PlantItemCabbage";
import { plantItemCarrot } from "./blueprints/PlantItemCarrot";
import { plantItemDuskwispHerb } from "./blueprints/PlantItemDuskwispHerb";
import { plantItemEggPlant } from "./blueprints/PlantItemEggPlant";
import { plantItemGreenGrape } from "./blueprints/PlantItemGreenGrape";
import { plantItemPotato } from "./blueprints/PlantItemPotato";
import { plantItemPumpkin } from "./blueprints/PlantItemPumpkin";
import { plantItemRedGrape } from "./blueprints/PlantItemRedGrape";
import { plantItemStrawberry } from "./blueprints/PlantItemStrawberry";
import { plantItemSunspireLotus } from "./blueprints/PlantItemSunspireLotus";
import { plantItemTomato } from "./blueprints/PlantItemTomato";
import { plantItemTurnip } from "./blueprints/PlantItemTurnip";
import { plantItemWatermelon } from "./blueprints/PlantItemWatermelon";
import { PlantItemBlueprint } from "./types/PlantTypes";

export const plantItemsBlueprintsIndex = {
  [PlantItemBlueprint.Carrot]: plantItemCarrot,
  [PlantItemBlueprint.Turnip]: plantItemTurnip,
  [PlantItemBlueprint.Tomato]: plantItemTomato,
  [PlantItemBlueprint.Strawberry]: plantItemStrawberry,
  [PlantItemBlueprint.RedGrape]: plantItemRedGrape,
  [PlantItemBlueprint.GreenGrape]: plantItemGreenGrape,
  [PlantItemBlueprint.Cabbage]: plantItemCabbage,
  [PlantItemBlueprint.Eggplant]: plantItemEggPlant,
  [PlantItemBlueprint.Pumpkin]: plantItemPumpkin,
  [PlantItemBlueprint.Watermelon]: plantItemWatermelon,
  [PlantItemBlueprint.Potato]: plantItemPotato,
  [PlantItemBlueprint.BloodrootBlossom]: plantItemBloodrootBlossom,
  [PlantItemBlueprint.DuskwispHerb]: plantItemDuskwispHerb,
  [PlantItemBlueprint.SunspireLotus]: plantItemSunspireLotus,
};
