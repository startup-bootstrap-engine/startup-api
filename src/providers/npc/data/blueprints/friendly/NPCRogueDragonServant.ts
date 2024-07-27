import { INPC } from "@entities/ModuleNPC/NPCModel";
import { FriendlyNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { CharacterClass, CharacterGender } from "@rpg-engine/shared";
import { generateRandomMovement } from "../../abstractions/BaseNeutralNPC";

export const npcRogueDragonServant = {
  ...generateRandomMovement(),
  name: "Rogue Dragon Servant",
  textureKey: "kobold",
  speed: 0.8,
  key: FriendlyNPCsBlueprint.RogueDragonServant,
  class: CharacterClass.None,
  gender: CharacterGender.Male,
} as Partial<INPC>;
