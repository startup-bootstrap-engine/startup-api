import { QuestsBlueprint } from "../../questsBlueprintTypes";
import { questInteractionClimber } from "./QuestInteractionClimber";
import { questInteractionCrimsonBackpack } from "./QuestInteractionCraftCrimsonBackpack";
import { questInteractionCraftSword } from "./QuestInteractionCraftSword";
import { questInteractionFather } from "./QuestInteractionFather";
import { questInteractionFisherman } from "./QuestInteractionFisherman";
import { questInteractionFishermanFarmland } from "./QuestInteractionFishermanFarmland";
import { questInteractionCraftIronArrow } from "./QuestInteractionIronArrow";
import { questInteractionShaman } from "./QuestInteractionShaman";
import { questInteractionStoryTeller } from "./QuestInteractionStoryTeller";
import { questInteractionTrader } from "./QuestInteractionTrader";

export const interactionQuests = {
  [QuestsBlueprint.InteractionTrader]: questInteractionTrader,
  [QuestsBlueprint.InteractionFather]: questInteractionFather,
  [QuestsBlueprint.InteractionCraftSword]: questInteractionCraftSword,
  [QuestsBlueprint.InteractionsCraftIronArrow]: questInteractionCraftIronArrow,
  [QuestsBlueprint.InteractionFisherman]: questInteractionFisherman,
  [QuestsBlueprint.InteractionStoryTeller]: questInteractionStoryTeller,
  [QuestsBlueprint.InteractionClimber]: questInteractionClimber,
  [QuestsBlueprint.InteractionShaman]: questInteractionShaman,
  [QuestsBlueprint.InteractionCraftCrimsonBackpack]: questInteractionCrimsonBackpack,
  [QuestsBlueprint.InteractionFishermanFarmland]: questInteractionFishermanFarmland,
};
