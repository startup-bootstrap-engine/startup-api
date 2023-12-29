import { INPC } from "@entities/ModuleNPC/NPCModel";
import { FriendlyNPCsBlueprint, HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { CharacterGender } from "@rpg-engine/shared";
import { generateRandomMovement } from "../../abstractions/BaseNeutralNPC";

export const npcDurganIronVein = {
  ...generateRandomMovement(),
  key: FriendlyNPCsBlueprint.DurganIronVein,
  name: "Durgan, the Miner",
  textureKey: HostileNPCsBlueprint.Dwarf,
  gender: CharacterGender.Male,
} as Partial<INPC>;
