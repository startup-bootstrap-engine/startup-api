import { GemsBlueprint } from "../../types/itemsBlueprintTypes";
import { itemEmeraldGem } from "./tier0/itemEmeraldGem";
import { itemSapphireGem } from "./tier0/itemSapphireGem";
import { itemTopazRadiance } from "./tier0/itemTopazRadiance";
import { itemCoralReefGem } from "./tier1/itemCoralReefGem";
import { itemMistyQuartzGem } from "./tier1/itemMistyQuartzGem";
import { itemRubyGem } from "./tier1/itemRubyGem";
import { itemEarthstoneGem } from "./tier2/itemEarthstoneGem";
import { itemJasperGem } from "./tier2/itemJasperGem";
import { itemObsidianGem } from "./tier2/itemObsidianGem";
import { itemAmethystGem } from "./tier3/itemAmethystGem";

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
