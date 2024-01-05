import { LegsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { IQuest, QuestType } from "@rpg-engine/shared";
import { QuestsBlueprint } from "../../questsBlueprintTypes";

export const questKillOrcWarlord = {
  title: "The Warlord's Demise",
  description:
    "Ilya, our beloved city, is under threat. A formidable Orc Warlord, known as Kargath Bladefist, has risen against the Warchief, challenging his rule. His strength is unmatched, his followers numerous. The Warchief seeks a brave soul to quell this uprising, to defeat Kargath and restore order. Return victorious, and be rewarded with a piece of history, a relic embodying the strength and honor of the Orc lineage.",
  key: QuestsBlueprint.KillOrcWarlord,
  rewards: [
    {
      itemKeys: [LegsBlueprint.FalconsLegs],
      qty: 1,
    },
  ],
  objectives: [
    {
      killCountTarget: 1,
      creatureKeys: [HostileNPCsBlueprint.OrcWarlord],
      type: QuestType.Kill,
    },
  ],
} as Partial<IQuest>;
