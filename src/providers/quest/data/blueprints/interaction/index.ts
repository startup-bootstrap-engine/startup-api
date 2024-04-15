import { QuestsBlueprint } from "../../questsBlueprintTypes";
import { questInteractionDurganMiner } from "./QuestDurganMiner";
import { questInteractionElrichTheHermit } from "./QuestElrichTheHermit";
import { questInteractionClimber } from "./QuestInteractionClimber";
import { questInteractionCrimsonBackpack } from "./QuestInteractionCraftCrimsonBackpack";
import { questInteractionCraftSword } from "./QuestInteractionCraftSword";
import { questInteractionEldenTimberheart } from "./QuestInteractionEldenTimberheart";
import { questInteractionFather } from "./QuestInteractionFather";
import { questInteractionFishermanFarmland } from "./QuestInteractionFishermanFarmland";
import { questInteractionFishermanFarmland2 } from "./QuestInteractionFishermanFarmland2";
import { questInteractionCraftIronArrow } from "./QuestInteractionIronArrow";
import { questInteractionRagnarokHornbreaker } from "./QuestInteractionRagnarokHornbreaker";
import { questInteractionShaman } from "./QuestInteractionShaman";
import { questInteractionStoryTeller } from "./QuestInteractionStoryTeller";
import { questInteractionTrader } from "./QuestInteractionTrader";

export const interactionQuests = {
  [QuestsBlueprint.InteractionTrader]: questInteractionTrader,
  [QuestsBlueprint.InteractionFather]: questInteractionFather,
  [QuestsBlueprint.InteractionCraftSword]: questInteractionCraftSword,
  [QuestsBlueprint.InteractionsCraftIronArrow]: questInteractionCraftIronArrow,
  [QuestsBlueprint.InteractionStoryTeller]: questInteractionStoryTeller,
  [QuestsBlueprint.InteractionClimber]: questInteractionClimber,
  [QuestsBlueprint.InteractionShaman]: questInteractionShaman,
  [QuestsBlueprint.InteractionCraftCrimsonBackpack]: questInteractionCrimsonBackpack,
  [QuestsBlueprint.InteractionFishermanFarmland]: questInteractionFishermanFarmland,
  [QuestsBlueprint.InteractionFishermanFarmland2]: questInteractionFishermanFarmland2,
  [QuestsBlueprint.InteractionDurganMiner]: questInteractionDurganMiner,
  [QuestsBlueprint.questInteractionEldenTimberheart]: questInteractionEldenTimberheart,
  [QuestsBlueprint.InteractionRagnarokHornbreaker]: questInteractionRagnarokHornbreaker,
  [QuestsBlueprint.InteractionElrichTheHermit]: questInteractionElrichTheHermit,
};
