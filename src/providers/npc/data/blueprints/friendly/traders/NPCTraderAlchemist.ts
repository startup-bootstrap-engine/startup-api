import { INPC } from "@entities/ModuleNPC/NPCModel";
import { CraftingResourcesBlueprint, PotionsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
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
      key: PotionsBlueprint.LightAntidote,
    },
    {
      key: PotionsBlueprint.LightEndurancePotion,
    },
    {
      key: PotionsBlueprint.LightLifePotion,
    },
    {
      key: PotionsBlueprint.LightManaPotion,
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
  ],
} as Partial<INPC>;
