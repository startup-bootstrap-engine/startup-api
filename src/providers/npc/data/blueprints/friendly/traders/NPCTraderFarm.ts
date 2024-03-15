import { INPC } from "@entities/ModuleNPC/NPCModel";
import { SeedsBlueprint, ToolsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { generateRandomMovement } from "@providers/npc/data/abstractions/BaseNeutralNPC";
import { FriendlyNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { CharacterGender } from "@rpg-engine/shared";

export const npcTraderFarm = {
  ...generateRandomMovement(),
  key: "trader-farm",
  name: "Farmer Joe",
  textureKey: FriendlyNPCsBlueprint.Trader,
  gender: CharacterGender.Male,
  isTrader: true,
  hasDepot: true,
  traderItems: [
    {
      key: ToolsBlueprint.WateringCan,
    },
    {
      key: ToolsBlueprint.CrimsonWateringCan,
    },
    {
      key: SeedsBlueprint.CarrotSeed,
    },
    {
      key: SeedsBlueprint.TomatoSeed,
    },
    {
      key: ToolsBlueprint.Scythe,
    },
  ],
} as Partial<INPC>;
