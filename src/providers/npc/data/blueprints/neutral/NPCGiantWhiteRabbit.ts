import { NeutralNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { generateMoveAwayMovement } from "../../abstractions/BaseNeutralNPC";
import { IBaseNPCBlueprint } from "../../types/npcTierTypes";
import { npcGiantBrownRabbit } from "./NPCGiantBrownRabbit";

export const npcGiantWhiteRabbit: IBaseNPCBlueprint = {
  ...generateMoveAwayMovement(),
  ...npcGiantBrownRabbit,
  name: "Giant Rabbit",
  key: NeutralNPCsBlueprint.GiantWhiteRabbit,
  textureKey: NeutralNPCsBlueprint.GiantWhiteRabbit,
};
