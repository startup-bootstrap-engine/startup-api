import { SeedsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { itemCabbageSeed } from "./ItemCabbageSeed";
import { itemCarrotSeed } from "./ItemCarrotSeed";
import { itemEggplantSeed } from "./ItemEggplantSeed";
import { itemGreenGrapeSeed } from "./ItemGreenGrapeSeed";
import { itemPotatoSeed } from "./ItemPotatoSeed";
import { itemPumpkinSeed } from "./ItemPumpkinSeed";
import { itemRedGrapeSeed } from "./ItemRedGrapeSeed";
import { itemStrawberrySeed } from "./ItemStrawberrySeed";
import { itemTomatoSeed } from "./ItemTomatoSeed";
import { itemTurnipSeed } from "./ItemTurnipSeed";
import { itemWatermelonSeed } from "./ItemWatermelonSeed";

export const seedsBlueprintIndex = {
  [SeedsBlueprint.CarrotSeed]: itemCarrotSeed,
  [SeedsBlueprint.TurnipSeed]: itemTurnipSeed,
  [SeedsBlueprint.TomatoSeed]: itemTomatoSeed,
  [SeedsBlueprint.StrawberrySeed]: itemStrawberrySeed,
  [SeedsBlueprint.RedGrapeSeed]: itemRedGrapeSeed,
  [SeedsBlueprint.GreenGrapeSeed]: itemGreenGrapeSeed,
  [SeedsBlueprint.CabbageSeed]: itemCabbageSeed,
  [SeedsBlueprint.EggplantSeed]: itemEggplantSeed,
  [SeedsBlueprint.PumpkinSeed]: itemPumpkinSeed,
  [SeedsBlueprint.WatermelonSeed]: itemWatermelonSeed,
  [SeedsBlueprint.PotatoSeed]: itemPotatoSeed,
};
