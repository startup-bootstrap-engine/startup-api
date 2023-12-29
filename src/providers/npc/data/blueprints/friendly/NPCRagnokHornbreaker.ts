import { INPC } from "@entities/ModuleNPC/NPCModel";
import { FriendlyNPCsBlueprint, HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { CharacterGender } from "@rpg-engine/shared";
import { generateRandomMovement } from "../../abstractions/BaseNeutralNPC";

export const npcRagnokHornbreaker = {
  ...generateRandomMovement(),
  key: FriendlyNPCsBlueprint.RagnokHornbreaker,
  name: "Ragnok Hornbreaker",
  textureKey: HostileNPCsBlueprint.Minotaur,
  gender: CharacterGender.Male,
} as Partial<INPC>;
