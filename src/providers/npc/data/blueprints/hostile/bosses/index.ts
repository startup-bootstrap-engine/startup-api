import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { npcAsterion } from "./NPCAsterion";

import { npcEloraTheQueen } from "./NPCElora";
import { npcGorgok } from "./NPCGorgok";
import { npcMalakarLichKing } from "./NPCMalakar";

export const bossesNPCs = {
  asterion: npcAsterion,
  gorgok: npcGorgok,
  [HostileNPCsBlueprint.EloraTheQueen]: npcEloraTheQueen,
  [HostileNPCsBlueprint.MalakarLichKing]: npcMalakarLichKing,
};
