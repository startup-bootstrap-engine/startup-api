import { INPC } from "@entities/ModuleNPC/NPCModel";
import {
  BooksBlueprint,
  GemsBlueprint,
  HelmetsBlueprint,
  StaffsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { generateRandomMovement } from "@providers/npc/data/abstractions/BaseNeutralNPC";
import { CharacterGender, MagicsBlueprint } from "@rpg-engine/shared";

export const npcTraderMage = {
  ...generateRandomMovement(),
  key: "trader-mage",
  name: "Lucius Shadowmoon",
  textureKey: "blue-mage-1",
  gender: CharacterGender.Male,
  isTrader: true,
  traderItems: [
    {
      key: StaffsBlueprint.AirWand,
    },
    {
      key: StaffsBlueprint.Wand,
    },
    {
      key: HelmetsBlueprint.WizardHat,
    },
    {
      key: MagicsBlueprint.Rune,
    },
    {
      key: BooksBlueprint.AstralAtlas,
    },
    {
      key: GemsBlueprint.EmeraldGem,
    },
    {
      key: GemsBlueprint.SapphireGem,
    },
    {
      key: GemsBlueprint.CoralReefGem,
    },
  ],
} as Partial<INPC>;
