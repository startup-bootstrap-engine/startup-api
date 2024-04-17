import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterGameMode, INITIAL_STARTING_POINTS } from "@providers/constants/CharacterConstants";
import { FromGridX, FromGridY } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(CharacterRespawn)
export class CharacterRespawn {
  @TrackNewRelicTransaction()
  public async respawnCharacter(character: ICharacter, extraProps?: Record<string, unknown>): Promise<ICharacter> {
    const initialStartingPoint = this.getInitialSpawnPoints(character);

    const updatedCharacter = await Character.findByIdAndUpdate(
      character._id,
      {
        $set: {
          isOnline: false,
          health: character.maxHealth,
          mana: character.maxMana,
          appliedEntityEffects: [],
          ...initialStartingPoint,
          ...extraProps,
        },
      },
      { new: true }
    );

    if (!updatedCharacter) {
      throw new Error(`Error updating character ${character._id}`);
    }

    return updatedCharacter;
  }

  public getInitialSpawnPoints(character: ICharacter): { x: number; y: number; scene: string } {
    let startingPoint;

    if (character.isFarmingMode) {
      startingPoint = INITIAL_STARTING_POINTS[CharacterGameMode.Farming];
    } else {
      // temple starting point
      startingPoint = {
        gridX: 93,
        gridY: 106,
        scene: "ilya",
      };
    }

    if (character.scene === "arena-hell") {
      startingPoint = {
        gridX: 110,
        gridY: 105,
        scene: "arena-hell",
      };
    }

    return {
      x: FromGridX(startingPoint.gridX),
      y: FromGridY(startingPoint.gridY),
      scene: startingPoint.scene,
    };
  }
}
