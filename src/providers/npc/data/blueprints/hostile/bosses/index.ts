import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { npcAsterion } from "../tier15/NPCAsterion";

import { npcGorgok } from "../tier17/NPCGorgok";
import { npcEloraTheQueen } from "../tier19/NPCElora";
import { npcMalakarLichKing } from "../tier19/NPCMalakar";

export const bossesNPCs = {
  asterion: npcAsterion,
  gorgok: npcGorgok,
  [HostileNPCsBlueprint.EloraTheQueen]: npcEloraTheQueen,
  [HostileNPCsBlueprint.MalakarLichKing]: npcMalakarLichKing,
};
