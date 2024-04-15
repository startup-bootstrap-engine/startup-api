import { ArmorsBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IQuest, QuestType } from "@rpg-engine/shared";
import { QuestsBlueprint } from "../../questsBlueprintTypes";

export const questInteractionElrichTheHermit = {
  title: "Bones of the Forgotten",
  description:
    "Venture to the old graveyard near the central rivers and retrieve any bones and a skull. These are crucial for a spell I intend to cast to resurrect a long-lost companion, Sleemer. Your reward will be a Blue Cape! Return to me when you have the items.",
  key: QuestsBlueprint.InteractionElrichTheHermit,
  rewards: [
    {
      itemKeys: [ArmorsBlueprint.BlueCape],
      qty: 1,
    },
  ],
  objectives: [
    {
      items: [
        { itemKey: CraftingResourcesBlueprint.Skull, qty: 1 },
        { itemKey: CraftingResourcesBlueprint.Bones, qty: 5 },
      ],
      type: QuestType.Interaction,
    },
  ],
} as Partial<IQuest>;
