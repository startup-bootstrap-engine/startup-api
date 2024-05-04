import { GemsBlueprint } from "../../types/itemsBlueprintTypes";
import { itemEmeraldGem } from "./tier0/itemEmeraldGem";
import { itemSapphireGem } from "./tier1/itemSapphireGem";
import { itemAmethystGem } from "./tier2/itemAmethystGem";
import { itemCoralReefGem } from "./tier3/itemCoralReefGem";
import { itemEarthstoneGem } from "./tier4/itemEarthstoneGem";
import { itemJasperGem } from "./tier5/itemJasperGem";
import { itemMistyQuartzGem } from "./tier6/itemMistyQuartzGem";
import { itemObsidianGem } from "./tier7/itemObsidianGem";
import { itemRubyGem } from "./tier8/itemRubyGem";
import { itemTopazRadiance } from "./tier9/itemTopazRadiance";

export const gemsBlueprintIndex = {
  [GemsBlueprint.TopazRadiance]: itemTopazRadiance,
  [GemsBlueprint.SapphireGem]: itemSapphireGem,
  [GemsBlueprint.EmeraldGem]: itemEmeraldGem,
  [GemsBlueprint.CoralReefGem]: itemCoralReefGem,
  [GemsBlueprint.MistyQuartzGem]: itemMistyQuartzGem,
  [GemsBlueprint.RubyGem]: itemRubyGem,
  [GemsBlueprint.EarthstoneGem]: itemEarthstoneGem,
  [GemsBlueprint.JasperGem]: itemJasperGem,
  [GemsBlueprint.ObsidianGem]: itemObsidianGem,
  [GemsBlueprint.AmethystGem]: itemAmethystGem,
};
