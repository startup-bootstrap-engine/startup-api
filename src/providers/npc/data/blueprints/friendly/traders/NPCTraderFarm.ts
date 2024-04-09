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
      key: SeedsBlueprint.DuskwispHerbSeed,
    },
    {
      key: SeedsBlueprint.BloodrootBlossomSeed,
    },
    {
      key: ToolsBlueprint.Scythe,
    },
    {
      key: SeedsBlueprint.CarrotSeed,
    },
    {
      key: SeedsBlueprint.TomatoSeed,
    },
    {
      key: SeedsBlueprint.StrawberrySeed,
    },
    {
      key: SeedsBlueprint.RedGrapeSeed,
    },
    {
      key: SeedsBlueprint.GreenGrapeSeed,
    },
    {
      key: SeedsBlueprint.CabbageSeed,
    },
    {
      key: SeedsBlueprint.EggplantSeed,
    },
    {
      key: SeedsBlueprint.PumpkinSeed,
    },
    {
      key: SeedsBlueprint.WatermelonSeed,
    },
    {
      key: SeedsBlueprint.PotatoSeed,
    },
    {
      key: SeedsBlueprint.SunspireLotusSeed,
    },
  ],
} as Partial<INPC>;
