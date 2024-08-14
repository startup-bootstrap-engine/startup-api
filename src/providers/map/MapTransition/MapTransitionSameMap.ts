import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterView } from "@providers/character/CharacterView";
import { battleAttackTarget } from "@providers/inversify/container";
import { Locker } from "@providers/locks/Locker";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { FromGridX, IViewDestroyElementPayload, MapSocketEvents, ViewSocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { IDestination } from "./MapTransitionQueue";

@provide(MapTransitionSameMap)
export class MapTransitionSameMap {
  constructor(private socketMessaging: SocketMessaging, private characterView: CharacterView, private locker: Locker) {}

  @TrackNewRelicTransaction()
  public async sameMapTeleport(character: ICharacter, destination: IDestination): Promise<void> {
    try {
      const canProceed = await this.locker.lock(`character-changing-scene-${character._id}`, 2);

      if (!canProceed) {
        return;
      }

      if (character.scene !== destination.map) {
        throw new Error(
          `Character Scene: "${character.scene}" and map to teleport: "${destination.map}" should be the same!`
        );
      }

      // change character map
      await Character.updateOne(
        { _id: character._id },
        {
          $set: {
            x: FromGridX(destination.gridX),
            y: FromGridX(destination.gridY),
            scene: destination.map,
          },
        }
      );

      await battleAttackTarget.clearCharacterBattleTarget(character);

      await this.characterView.clearCharacterView(character);

      // send event to client telling it that a character has been teleported?

      this.socketMessaging.sendEventToUser(character.channelId!, MapSocketEvents.SameMapTeleport, destination);

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
