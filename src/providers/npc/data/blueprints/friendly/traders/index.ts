import { FriendlyNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { npcBlacksmith } from "./NPCBlacksmith";
import { npcTrader } from "./NPCTrader";
import { npcTraderAlchemist } from "./NPCTraderAlchemist";
import { npcTraderArcher } from "./NPCTraderArcher";
import { npcTraderFarm } from "./NPCTraderFarm";
import { npcTraderFood } from "./NPCTraderFood";
import { npcTraderHerbalist } from "./NPCTraderHerb";
import { npcTraderJewelry } from "./NPCTraderJewelry";
import { npcTraderMage } from "./NPCTraderMage";
import { npcTraderTavern } from "./NPCTraderTavern";
import { npcTraderTeleport } from "./NPCTraderTeleport";
import { npcTraderTools } from "./NPCTraderTools";
import { npcTraderTraining } from "./NPCTraderTraining";

export const tradersNPCs = {
  [FriendlyNPCsBlueprint.Blacksmith]: npcBlacksmith,
  [FriendlyNPCsBlueprint.Trader]: npcTrader,
  [FriendlyNPCsBlueprint.TraderFood]: npcTraderFood,
  [FriendlyNPCsBlueprint.TraderMage]: npcTraderMage,
  [FriendlyNPCsBlueprint.TraderArcher]: npcTraderArcher,
  [FriendlyNPCsBlueprint.TraderAlchemist]: npcTraderAlchemist,
  [FriendlyNPCsBlueprint.TraderTraining]: npcTraderTraining,
  [FriendlyNPCsBlueprint.TraderHerb]: npcTraderHerbalist,
  [FriendlyNPCsBlueprint.TraderJewelry]: npcTraderJewelry,
  [FriendlyNPCsBlueprint.TraderTavern]: npcTraderTavern,
  [FriendlyNPCsBlueprint.TraderTeleport]: npcTraderTeleport,
  [FriendlyNPCsBlueprint.TraderFarm]: npcTraderFarm,
  [FriendlyNPCsBlueprint.TraderTools]: npcTraderTools,
};
