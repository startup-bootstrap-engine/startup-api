import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IQuest, QuestType } from "@rpg-engine/shared";
import { QuestsBlueprint } from "../../questsBlueprintTypes";

export const questInteractionEldenTimberheart = {
  title: "Archer's Allegiance: The Timber Task",
  description:
    "Embark on a quest of craftsmanship! Deliver to me 10 Wooden Boards, hewn from the heart of the forest, and I shall bestow upon you an archer's treasure: a bow, whispering of distant winds, and 100 arrows, each eager for flight. Together, let's turn the whispers of the woods into the might of a marksman!",
  key: QuestsBlueprint.questInteractionEldenTimberheart,
  rewards: [
    {
      itemKeys: [RangedWeaponsBlueprint.Bow],
      qty: 1,
    },
    {
      itemKeys: [RangedWeaponsBlueprint.Arrow],
      qty: 100,
    },
  ],
  objectives: [
    {
      items: [{ itemKey: CraftingResourcesBlueprint.WoodenBoard, qty: 10 }],
      type: QuestType.Interaction,
    },
  ],
} as Partial<IQuest>;
