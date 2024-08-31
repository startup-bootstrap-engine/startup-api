import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { Locker } from "@providers/locks/Locker";
import { MapTiles } from "@providers/map/MapTiles";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { Stun } from "@providers/spells/data/logic/warrior/Stun";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import {
  AnimationDirection,
  CharacterSocketEvents,
  ICharacterSyncPosition,
  IUIShowMessage,
  MapLayers,
  ToGridX,
  ToGridY,
  UISocketEvents,
} from "@rpg-engine/shared";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";
import { CharacterValidation } from "../CharacterValidation";

@provide(CharacterMovementValidation)
export class CharacterMovementValidation {
  constructor(
    private characterValidation: CharacterValidation,
    private movementHelper: MovementHelper,
    private socketMessaging: SocketMessaging,
    private locker: Locker,
    private newRelic: NewRelic,
    private stun: Stun,
    private mapTiles: MapTiles
  ) {}

  @TrackNewRelicTransaction()
  public async isValid(character: ICharacter, newX: number, newY: number, isMoving: boolean): Promise<boolean> {
    if (!isMoving) {
      return true; // if character is not moving, we dont need to check anything else!
    }

    const hasBasicValidation = this.characterValidation.hasBasicValidation(character);

    if (!hasBasicValidation) {
      console.log(`🚫 ${character.name} has no basic validation!`);
      return false;
    }

    const isLocked = await this.locker.hasLock(`character-changing-scene-${character._id}`);

    if (isLocked) {
      console.error(`🚫 ${character.name} is trying to move while changing the scene`);
      return false;
    }

    if (await this.stun.isStun(character)) {
      this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
        message: "Sorry, you can't move because you're stunned",
        type: "error",
      });
      return false;
    }

    if (!this.movementHelper.isSnappedToGrid(newX, newY)) {
      console.error(`🚫 ${character.name} lost snapping to grid!`);
      return false;
    }

    const isTooHeavy = this.isCharacterTooHeavy(character);

    if (isTooHeavy) {
      console.log(`🚫 ${character.name} is too heavy to move!`);
      return false;
    }

    const isMovingTooFast = this.isCharacterMovingTooFast(character);

    if (isMovingTooFast) {
      console.log(`🚫 ${character.name} is moving too fast!`);
      return false;
    }

    const isSolid = await this.movementHelper.isSolid(
      character.scene,
      ToGridX(newX),
      ToGridY(newY),
      MapLayers.Character
    );

    if (isSolid) {
      this.newRelic.trackMetric(
        NewRelicMetricCategory.Count,
        NewRelicSubCategory.Characters,
        "Desync/SolidCollision",
        1
      );

      console.log(`🚫 ${character.name} is trying to move to a solid!`);

      // try to deviate the character from the solid. First check if there's a  empty position around

      const potentialDirections = [
        this.movementHelper.calculateNewPositionXY(newX, newY, "up"),
        this.movementHelper.calculateNewPositionXY(newX, newY, "down"),
        this.movementHelper.calculateNewPositionXY(newX, newY, "left"),
        this.movementHelper.calculateNewPositionXY(newX, newY, "right"),
      ];

      // We'll check each potential direction for solidity.
      for (let i = 0; i < potentialDirections.length; i++) {
        const potentialPosition = potentialDirections[i];
        const potentialSolid = await this.movementHelper.isSolid(
          character.scene,
          ToGridX(potentialPosition.x),
          ToGridY(potentialPosition.y),
          MapLayers.Character
        );

        // If the potential direction isn't solid, we move the character there.
        if (!potentialSolid) {
          this.socketMessaging.sendEventToUser<ICharacterSyncPosition>(
            character.channelId!,
            CharacterSocketEvents.CharacterSyncPosition,
            {
              id: character.id,
              position: {
                originX: potentialPosition.x,
                originY: potentialPosition.y,
                direction: character.direction as AnimationDirection,
              },
            }
          );
          return true;
        }
      }

      return false;
    }

    const isDestinationCoordinateValid = this.mapTiles.isMapCoordinateWithinBounds(
      character.scene,
      ToGridX(newX),
      ToGridY(newY)
    );

    if (!isDestinationCoordinateValid) {
      console.error(`🚫 ${character.name} is trying to move to an invalid destination coordinate!`);
      return false;
    }

    return true;
  }

  private isCharacterTooHeavy(character: ICharacter): boolean {
    if (character.speed === 0) {
      this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
        message: "Sorry, you're too heavy to move. Please drop something from your inventory.",
        type: "error",
      });
      return true;
    }

    return false;
  }

  private isCharacterMovingTooFast(character: ICharacter): boolean {
    if (character.lastMovement) {
      const now = dayjs(new Date());
      const lastMovement = dayjs(character.lastMovement);
      const movementDiff = now.diff(lastMovement, "millisecond");

      if (movementDiff < character.movementIntervalMs / 4 || character.baseSpeed > 6.5) {
        console.log(`⚠️ ${character.name} is moving too fast!`);
        this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
          message: "Sorry, you're moving too fast.",
          type: "error",
        });
        return true;
      }
    }
    return false;
  }
}
