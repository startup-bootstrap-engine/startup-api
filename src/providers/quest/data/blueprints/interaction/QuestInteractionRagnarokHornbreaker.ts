import { ShieldsBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { FriendlyNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { IQuest, QuestType } from "@rpg-engine/shared";
import { QuestsBlueprint } from "../../questsBlueprintTypes";

export const questInteractionRagnarokHornbreaker = {
  title: "Labyrinth of Greed",
  description:
    "The once noble halls of Ironforge have become a maze of treachery, echoing with the clatter of greed. Ragnok Hornbreaker, a minotaur with a heavy heart, seeks to cleanse this corruption. He calls upon you to challenge and defeat 15 dwarves, lost to the shadows of avarice. Undertake this quest to cut through the darkness with the might of justice, and return with tales of your bravery. Your deeds shall be rewarded with ancient treasures, reflecting the honor and strength of days long past. Speak with him, he's in a cave nearby and will provide you weapons.",
  key: QuestsBlueprint.InteractionRagnarokHornbreaker,
  rewards: [
    {
      itemKeys: [SwordsBlueprint.BroadSword],
      qty: 1,
    },
    {
      itemKeys: [ShieldsBlueprint.StuddedShield],
      qty: 1,
    },
  ],
  objectives: [
    {
      targetNPCkey: FriendlyNPCsBlueprint.RagnokHornbreaker,
      type: QuestType.Interaction,
    },
  ],
} as Partial<IQuest>;
