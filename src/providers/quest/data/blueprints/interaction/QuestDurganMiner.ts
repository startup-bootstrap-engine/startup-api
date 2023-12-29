import { ArmorsBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IQuest, QuestType } from "@rpg-engine/shared";
import { QuestsBlueprint } from "../../questsBlueprintTypes";

export const questInteractionDurganMiner = {
  title: "Iron Ingot Craftsmanship",
  description:
    "Employ your pickaxe to mine ore, followed by utilizing your blacksmith hammer. Select 'Use with,' then target an anvil to forge ingots. Provide me with 10 Iron Ingots, and I shall craft you an Iron Armor!",
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
