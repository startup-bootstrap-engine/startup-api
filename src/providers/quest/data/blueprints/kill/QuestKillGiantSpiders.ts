import { ContainersBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { IQuest, QuestType } from "@rpg-engine/shared";
import { QuestsBlueprint } from "../../questsBlueprintTypes";

export const questKillGiantSpiders = {
  title: "Exterminate the Giant Spiders",
  description:
    "Giant spiders have infested the nearby forests, posing a threat to the village and its people. These creatures are not only deadly but also breed rapidly, making them a growing menace. Brave heroes are needed to venture into the spider-infested woods and exterminate these creatures. Be warned, these spiders are venomous and highly aggressive. Will you rise to the challenge and help rid the village of this danger? Kill 10 of them for me and you'll be rewarded!",
  key: QuestsBlueprint.KillGiantSpiders,
  rewards: [
    {
      itemKeys: [ContainersBlueprint.HuntersBackpack],
      qty: 1,
    },
    {
      itemKeys: [CraftingResourcesBlueprint.SewingThread],
      qty: 100,
    },
  ],
  objectives: [
    {
      killCountTarget: 10,
      creatureKeys: [HostileNPCsBlueprint.GiantSpider],
      type: QuestType.Kill,
    },
  ],
} as Partial<IQuest>;
