import { CraftingResourcesBlueprint, FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { NeutralNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { IQuest, QuestType } from "@rpg-engine/shared";
import { QuestsBlueprint } from "../../questsBlueprintTypes";

export const questKillDeers = {
  title: "Kill 20 Deers",
  description:
    "Forests have dangerous creatures and also delicious food. Hunt 20 deers for survival and get your reward!",
  key: QuestsBlueprint.KillDeers,
  rewards: [
    {
      itemKeys: [FoodsBlueprint.RedMeat],
      qty: 10,
    },
    {
      itemKeys: [FoodsBlueprint.RawBeefSteak],
      qty: 10,
    },
    {
      itemKeys: [CraftingResourcesBlueprint.Leather],
      qty: 20,
    },
  ],
  objectives: [
    {
      killCountTarget: 20,
      creatureKeys: [NeutralNPCsBlueprint.Deer],
      type: QuestType.Kill,
    },
  ],
} as Partial<IQuest>;
