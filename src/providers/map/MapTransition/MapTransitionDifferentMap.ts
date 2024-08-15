import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterView } from "@providers/character/CharacterView";
import { battleAttackTarget } from "@providers/inversify/container";
import { Locker } from "@providers/locks/Locker";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  FromGridX,
  IMapTransitionChangeMapPayload,
  IViewDestroyElementPayload,
  MapSocketEvents,
  ViewSocketEvents,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { IDestination } from "./MapTransitionQueue";

@provide(MapTransitionDifferentMap)
export class MapTransitionDifferentMap {
  constructor(private socketMessaging: SocketMessaging, private characterView: CharacterView, private locker: Locker) {}

  @TrackNewRelicTransaction()
  public async changeCharacterScene(character: ICharacter, destination: IDestination): Promise<void> {
    try {
      const canProceed = await this.locker.lock(`character-changing-scene-${character._id}`, 2);

      if (!canProceed) {
        return;
      }

      // fetch destination properties
      // change character map
      await Character.updateOne(
        { _id: character._id },
        {
          $set: {
            scene: destination.map,
            x: FromGridX(destination.gridX),
            y: FromGridX(destination.gridY),
          },
        }
      );

      await battleAttackTarget.clearCharacterBattleTarget(character);

      await this.characterView.clearCharacterView(character);
      /* 
      Send event to client telling it to restart the map. 
      We don't need to specify which, because it will trigger a character 
      refresh and scene reload on the client side. 
      */

      this.socketMessaging.sendEventToUser<IMapTransitionChangeMapPayload>(
        character.channelId!,
        MapSocketEvents.ChangeMap,
        {
          map: destination.map,
          x: FromGridX(destination.gridX),
          y: FromGridX(destination.gridY),
        }
      );

      await this.socketMessaging.sendEventToCharactersAroundCharacter<IViewDestroyElementPayload>(
        character,
        ViewSocketEvents.Destroy,
        {
          type: "characters",
          id: character._id,
        }
      );
    } catch (error) {
      console.error(error);
    } finally {
      await this.locker.unlock(`character-changing-scene-${character._id}`);
    }
  }
}
