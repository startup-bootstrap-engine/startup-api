import { INPC } from "@entities/ModuleNPC/NPCModel";
import { GemsBlueprint, ToolsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { generateRandomMovement } from "@providers/npc/data/abstractions/BaseNeutralNPC";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { CharacterGender } from "@rpg-engine/shared";

export const npcTraderTools = {
  ...generateRandomMovement(),
  key: "trader-tools",
  name: "Gearmaster Cycraft",
  textureKey: HostileNPCsBlueprint.Cyclops,
  gender: CharacterGender.Male,
  isTrader: true,
  traderItems: [
    {
      key: ToolsBlueprint.MoonlureFishingRod,
    },
    {
      key: ToolsBlueprint.AurumAlloyPickaxe,
    },
    {
      key: ToolsBlueprint.ElderHeartAxe,
    },
    {
      key: ToolsBlueprint.LogSplitterAxe,
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
