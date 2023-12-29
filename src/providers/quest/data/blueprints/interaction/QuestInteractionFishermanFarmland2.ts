import { BootsBlueprint, FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IQuest, QuestType } from "@rpg-engine/shared";
import { QuestsBlueprint } from "../../questsBlueprintTypes";

export const questInteractionFishermanFarmland2 = {
  title: "Fish 10x Tunas",
  description:
    "Use your fishing rod to fish 10x Tunas. Just click on it, set 'Use With', then click on the water. Make sure you have a fishing rod and worms in your inventory! I'll give you a pair of Studded Boots if you accomplish this task!",
  key: QuestsBlueprint.InteractionFishermanFarmland2,
  rewards: [
    {
      itemKeys: [BootsBlueprint.StuddedBoots],
      qty: 100,
    },
  ],
  objectives: [
    {
      items: [{ itemKey: FoodsBlueprint.Tuna, qty: 10 }],
      type: QuestType.Interaction,
    },
  ],
} as Partial<IQuest>;
