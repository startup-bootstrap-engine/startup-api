import { INPC } from "@entities/ModuleNPC/NPCModel";
import { FriendlyNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { CharacterGender } from "@rpg-engine/shared";
import { generateRandomMovement } from "../../abstractions/BaseNeutralNPC";

export const npcMarlinTheFisherman = {
  ...generateRandomMovement(),
  key: FriendlyNPCsBlueprint.MarlinFisherman,
  name: "Marlin, the fisherman",
  textureKey: FriendlyNPCsBlueprint.SeniorKnight1,
  gender: CharacterGender.Male,
} as Partial<INPC>;
