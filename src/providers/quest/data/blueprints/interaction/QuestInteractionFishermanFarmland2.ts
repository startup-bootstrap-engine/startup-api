import { BootsBlueprint, FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IQuest, QuestType } from "@rpg-engine/shared";
import { QuestsBlueprint } from "../../questsBlueprintTypes";

export const questInteractionFishermanFarmland2 = {
  title: "Fish 3x Brown Fish",
  description:
    "Use your fishing rod to fish 3x brown fish. Just click on it, set 'Use With', then click on the water. Make sure you have a fishing rod and worms in your inventory! I'll give you a pair of Studded Boots if you accomplish this task!",
  key: QuestsBlueprint.InteractionFishermanFarmland2,
  rewards: [
    {
      itemKeys: [BootsBlueprint.StuddedBoots],
      qty: 1,
    },
  ],
  objectives: [
    {
      items: [{ itemKey: FoodsBlueprint.BrownFish, qty: 3 }],
      type: QuestType.Interaction,
    },
  ],
} as Partial<IQuest>;
