import { ArmorsBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IQuest, QuestType } from "@rpg-engine/shared";
import { QuestsBlueprint } from "../../questsBlueprintTypes";

export const questInteractionDurganMiner = {
  title: "Craft an item using ingots",
  description:
    "Use your pickaxe to extract ore, then your blacksmith hammer to craft an item using the ingots. Give me 10x Iron Ingot and I will craft an Iron Armor to you!",
  key: QuestsBlueprint.InteractionDurganMiner,
  rewards: [
    {
      itemKeys: [ArmorsBlueprint.IronArmor],
      qty: 1,
    },
  ],
  objectives: [
    {
      items: [{ itemKey: CraftingResourcesBlueprint.IronIngot, qty: 10 }],
      type: QuestType.Interaction,
    },
  ],
} as Partial<IQuest>;
