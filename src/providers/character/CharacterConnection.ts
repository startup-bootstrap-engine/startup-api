import { Character } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { provide } from "inversify-binding-decorators";

@provide(CharacterConnection)
export class CharacterConnection {
  @TrackNewRelicTransaction()
  public async resetCharacterAttributes(filter: Record<string, unknown> = {}): Promise<void> {
    await Character.updateMany(filter, {
      $set: {
        isOnline: false,
      },
      $unset: {
        target: 1,
      },
    });
  }
}
