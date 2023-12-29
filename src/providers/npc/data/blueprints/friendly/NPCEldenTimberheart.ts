import { INPC } from "@entities/ModuleNPC/NPCModel";
import { FriendlyNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { CharacterGender } from "@rpg-engine/shared";
import { generateRandomMovement } from "../../abstractions/BaseNeutralNPC";

export const npcEldenTimberheart = {
  ...generateRandomMovement(),
  key: FriendlyNPCsBlueprint.EldenTimberheart,
  name: "Elden Timberheart",
  textureKey: "elf-white-hair-1",
  gender: CharacterGender.Male,
} as Partial<INPC>;
