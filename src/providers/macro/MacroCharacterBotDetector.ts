import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterActionsTracker } from "@providers/character/CharacterActionsTracker";
import {
  ANTI_MACRO_ACTION_SIMILARITY_RATIO_THRESHOLD,
  ANTI_MACRO_IDLE_THRESHOLD,
  ANTI_MACRO_SKIP_EVENTS_FROM_SIMILARITY_CHECK,
} from "@providers/constants/AntiMacroConstants";
import { provide } from "inversify-binding-decorators";

@provide(MacroCharacterBotDetector)
export class MacroCharacterBotDetector {
  constructor(private characterActionsTracker: CharacterActionsTracker) {}

  public async isPotentialBotUser(character: ICharacter): Promise<boolean> {
    const [isIdle, areActionsSimilar, hasMultiClient] = await Promise.all([
      this.isCharacterIdle(character),
      this.areLastActionsTooSimilar(character),
      this.hasMultiClient(character),
    ]);

    return isIdle || areActionsSimilar || hasMultiClient;
  }

  private isCharacterIdle(character: ICharacter): boolean {
    const { lastMovement } = character;

    if (!lastMovement) {
      return false;
    }

    const timeSinceLastMovement = Date.now() - new Date(lastMovement).getTime();

    return timeSinceLastMovement > ANTI_MACRO_IDLE_THRESHOLD;
  }

  private async areLastActionsTooSimilar(character: ICharacter): Promise<boolean> {
    const lastActions = await this.characterActionsTracker.getCharacterActions(character._id);

    let actionCount = 0;
    const uniqueActions = new Set();

    for (const action of lastActions) {
      if (!ANTI_MACRO_SKIP_EVENTS_FROM_SIMILARITY_CHECK.includes(action)) {
        uniqueActions.add(action);
        actionCount++;
      }
    }

    if (actionCount === 0) {
      return false;
    }

    const similarityRatio = uniqueActions.size / actionCount;

    return similarityRatio <= ANTI_MACRO_ACTION_SIMILARITY_RATIO_THRESHOLD;
  }

  private async hasMultiClient(character: ICharacter): Promise<boolean> {
    // Use the aggregation framework for more efficient querying
    const result = await Character.aggregate([
      { $match: { owner: character.owner, isOnline: true } }, // Match documents with the same owner and that are online
      { $limit: 2 }, // Limit the results to 2 documents to ensure we only check for the presence of more than one
      { $count: "onlineCharacters" }, // Count the number of documents that match the criteria
    ]);

    // The result is an array of one object if the match is found, and it's empty if no matches are found.
    // If there's at least one document, it means there's more than one character online for the same owner.
    return result.length > 0 && result[0].onlineCharacters > 1;
  }
}
