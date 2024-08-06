import { INPC } from "@entities/ModuleNPC/NPCModel";
import { CraftingResourcesBlueprint, PotionsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { generateRandomMovement } from "@providers/npc/data/abstractions/BaseNeutralNPC";
import { CharacterGender } from "@rpg-engine/shared";

export const npcTraderHerbalist = {
  ...generateRandomMovement(),
  key: "trader-herb",
  name: "Nightshade the Herbalist",
  textureKey: "human-girl-1",
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
      key: CraftingResourcesBlueprint.Worm,
    },
    {
      key: CraftingResourcesBlueprint.Herb,
    },
    {
      key: CraftingResourcesBlueprint.Herb,
    },
  ],
} as Partial<INPC>;
