import { INPC } from "@entities/ModuleNPC/NPCModel";
import { AccessoriesBlueprint, GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { generateRandomMovement } from "@providers/npc/data/abstractions/BaseNeutralNPC";
import { CharacterGender } from "@rpg-engine/shared";

export const npcTraderJewelry = {
  ...generateRandomMovement(),
  key: "jewelry-trader",
  name: "Ion Langley",
  textureKey: "human-girl-4",
  gender: CharacterGender.Female,
  isTrader: true,
  traderItems: [
    {
      key: AccessoriesBlueprint.StarNecklace,
    },
    {
      key: AccessoriesBlueprint.AmazonsNecklace,
    },
    {
      key: AccessoriesBlueprint.SoldiersRing,
    },
    {
      key: AccessoriesBlueprint.SapphireRing,
    },
    {
      key: AccessoriesBlueprint.IronRing,
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
