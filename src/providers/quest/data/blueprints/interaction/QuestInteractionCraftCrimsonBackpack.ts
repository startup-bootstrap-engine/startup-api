import { ContainersBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IQuest, QuestType } from "@rpg-engine/shared";
import { QuestsBlueprint } from "../../questsBlueprintTypes";

export const questInteractionCrimsonBackpack = {
  title: "Craft a Crimson Backpack",
  description:
    "As a servant of the almighty red dragon, I've learned the art of crafting the Crimson Backpack. It's a powerful item, but it requires the essence of our lords to create. Bring me 20 dragon heads, 100 red sapphires and I will craft this magnificent backpack for you.",
  key: QuestsBlueprint.InteractionCraftCrimsonBackpack,
  rewards: [
    {
      itemKeys: [ContainersBlueprint.CrimsonBackpack],
      qty: 1,
    },
  ],
  objectives: [
    {
      items: [
        { itemKey: CraftingResourcesBlueprint.DragonHead, qty: 20 },
        { itemKey: CraftingResourcesBlueprint.RedSapphire, qty: 100 },
      ],
      type: QuestType.Interaction,
    },
  ],
} as Partial<IQuest>;
