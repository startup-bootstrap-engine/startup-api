import { SeedsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { PlantItemBlueprint } from "./types/PlantTypes";

export const seedToPlantMapping: Record<string, string> = {
  [SeedsBlueprint.CabbageSeed]: PlantItemBlueprint.Cabbage,
  [SeedsBlueprint.CarrotSeed]: PlantItemBlueprint.Carrot,
  [SeedsBlueprint.EggplantSeed]: PlantItemBlueprint.Eggplant,
  [SeedsBlueprint.GreenGrapeSeed]: PlantItemBlueprint.GreenGrape,
  [SeedsBlueprint.PotatoSeed]: PlantItemBlueprint.Potato,
  [SeedsBlueprint.PumpkinSeed]: PlantItemBlueprint.Pumpkin,
  [SeedsBlueprint.RedGrapeSeed]: PlantItemBlueprint.RedGrape,
  [SeedsBlueprint.StrawberrySeed]: PlantItemBlueprint.Strawberry,
  [SeedsBlueprint.TomatoSeed]: PlantItemBlueprint.Tomato,
  [SeedsBlueprint.TurnipSeed]: PlantItemBlueprint.Turnip,
  [SeedsBlueprint.WatermelonSeed]: PlantItemBlueprint.Watermelon,
  [SeedsBlueprint.BloodrootBlossomSeed]: PlantItemBlueprint.BloodrootBlossom,
  [SeedsBlueprint.DuskwispHerbSeed]: PlantItemBlueprint.DuskwispHerb,
  [SeedsBlueprint.SunspireLotusSeed]: PlantItemBlueprint.SunspireLotus,
};
