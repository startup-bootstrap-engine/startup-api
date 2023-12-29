import { CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { FriendlyNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { IQuest, QuestType } from "@rpg-engine/shared";
import { QuestsBlueprint } from "../../questsBlueprintTypes";

export const questInteractionFishermanFarmland = {
  title: "Speak with Marlin, the fisherman",
  description:
    "Speak with Marlin, the Fisherman, south of the farm, so you can learn how to fish! Fish can be used to eat and recover your HP/mana and also to craft some tasty foods!",
  key: QuestsBlueprint.InteractionFishermanFarmland,
  rewards: [
    {
      itemKeys: [CraftingResourcesBlueprint.Worm],
      qty: 100,
    },
  ],
  objectives: [
    {
      targetNPCkey: FriendlyNPCsBlueprint.MarlinFisherman,
      type: QuestType.Interaction,
    },
  ],
} as Partial<IQuest>;
