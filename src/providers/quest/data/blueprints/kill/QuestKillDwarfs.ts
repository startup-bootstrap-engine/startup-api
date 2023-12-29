import { AccessoriesBlueprint, BootsBlueprint, LegsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { IQuest, QuestType } from "@rpg-engine/shared";
import { QuestsBlueprint } from "../../questsBlueprintTypes";

export const questKillDwarfs = {
  title: "Echoes of Avarice",
  description:
    "Ragnok Hornbreaker, a formidable minotaur with a lineage as ancient as the mountains, seeks a brave soul to temper the darkness spreading from Ironforge. Corrupted by greed, 7 dwarves have strayed far from their honorable forge and kinship, becoming threats to all. Ragnok entrusts you to restore the balance: defeat these fallen dwarves and prove that honor can prevail over greed. Return victorious, and be rewarded with a piece of history, a relic embodying the strength and honor of the minotaur lineage.",
  key: QuestsBlueprint.KillDwarfs,
  rewards: [
    {
      itemKeys: [LegsBlueprint.StuddedLegs],
      qty: 1,
    },
    {
      itemKeys: [BootsBlueprint.StuddedBoots],
      qty: 1,
    },
    {
      itemKeys: [AccessoriesBlueprint.WolfToothChain],
      qty: 1,
    },
  ],
  objectives: [
    {
      killCountTarget: 7,
      creatureKeys: [HostileNPCsBlueprint.Dwarf],
      type: QuestType.Kill,
    },
  ],
} as Partial<IQuest>;
