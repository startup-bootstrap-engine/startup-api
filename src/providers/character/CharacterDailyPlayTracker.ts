import { Character } from "@entities/ModuleCharacter/CharacterModel";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";

@provide(CharacterDailyPlayTracker)
export class CharacterDailyPlayTracker {
  public async updateCharacterDailyPlay(characterId: string): Promise<void> {
    const character = await Character.findById(characterId).lean();

    if (!character) {
      console.error("Character not found");
      return;
    }

    const today = dayjs().startOf("day");
    const lastDayPlayed = character.lastDayPlayed ? dayjs(character.lastDayPlayed).startOf("day") : null;

    if (!lastDayPlayed || today.isAfter(lastDayPlayed)) {
      // Increment totalDaysPlayed if lastDayPlayed is different from today
      const totalDaysPlayed = (character.totalDaysPlayed || 0) + 1;
      const lastDayPlayed = today.toDate();

      await Character.updateOne(
        { _id: characterId },
        {
          $set: {
            totalDaysPlayed: totalDaysPlayed,
            lastDayPlayed: lastDayPlayed,
          },
        }
      );
    }
  }
}
