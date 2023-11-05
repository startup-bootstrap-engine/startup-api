import { ArmorsBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { IQuest, QuestType } from "@rpg-engine/shared";
import { QuestsBlueprint } from "../../questsBlueprintTypes";

export const questKillNazgul = {
  title: "Kill 3 Nazguls",
  description:
    "Ahoy, adventurer. The Lost Temple on yonder island, once a beacon of knowledge, now casts a shadow of dread across these waters. Inside its forsaken halls roam 3 Nazguls, once powerful sorcerers, now spectral menaces. For the safety of my crew and these trade routes, I beseech you to rid us of this looming threat. In return, treasures from the deep await you. Do you have the mettle?",
  key: QuestsBlueprint.KillNazguls,
  rewards: [
    {
      itemKeys: [ArmorsBlueprint.BloodfireArmor],
      qty: 1,
    },
    {
      itemKeys: [SwordsBlueprint.NemesisSword],
      qty: 1,
    },
  ],
  objectives: [
    {
      killCountTarget: 3,
      creatureKeys: [HostileNPCsBlueprint.Nazgul],
      type: QuestType.Kill,
    },
  ],
} as Partial<IQuest>;
