import { INPC } from "@entities/ModuleNPC/NPCModel";
import {
  CraftingResourcesBlueprint,
  GemsBlueprint,
  PotionsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { CharacterGender } from "@rpg-engine/shared";
import { generateRandomMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcTraderAlchemist = {
  ...generateRandomMovement(),
  key: "trader-alchemist",
  name: "Rhys the Alchemist",
  textureKey: "redhair-girl-1",
  gender: CharacterGender.Female,
  isTrader: true,
  traderItems: [
    {
      key: PotionsBlueprint.LightLifePotion,
    },
    {
      key: PotionsBlueprint.LightManaPotion,
    },
    {
      key: PotionsBlueprint.GreaterManaPotion,
    },
    {
      key: PotionsBlueprint.GreaterLifePotion,
    },
    {
      key: PotionsBlueprint.ManaPotion,
    },
    {
      key: PotionsBlueprint.LifePotion,
    },
    {
      key: CraftingResourcesBlueprint.Bandage,
    },
    {
      key: PotionsBlueprint.AcidFlask,
    },
    {
      key: PotionsBlueprint.BlazingFirebomb,
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
