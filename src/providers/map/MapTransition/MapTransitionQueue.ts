import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { GuildTerritory } from "@providers/guild/GuildTerritory";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { ITiledObject } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { MapNonPVPZone } from "../MapNonPVPZone";
import { MapTiles } from "../MapTiles";
import { MapTransitionDifferentMap } from "./MapTransitionDifferentMap";
import { MapTransitionInfo } from "./MapTransitionInfo";
import { MapTransitionSameMap } from "./MapTransitionSameMap";
import { MapTransitionValidator } from "./MapTransitionValidator";

export interface IDestination {
  map: string;
  gridX: number;
  gridY: number;
}

@provide(MapTransitionQueue)
export class MapTransitionQueue {
  constructor(
    private mapTransitionInfo: MapTransitionInfo,

    private mapNonPVPZone: MapNonPVPZone,
    private mapTransitionSameMap: MapTransitionSameMap,
    private mapTransitionDifferentMap: MapTransitionDifferentMap,
    private mapTransitionValidator: MapTransitionValidator,
    private dynamicQueue: DynamicQueue,
    private mapTiles: MapTiles,
    private guildTerritory: GuildTerritory,
    private socketMessaging: SocketMessaging
  ) {}

  @TrackNewRelicTransaction()
  public async handleMapTransition(character: ICharacter, newX: number, newY: number): Promise<void> {
    const transition = this.getTransition(character, newX, newY);
    if (!transition) return;

    const destination = this.getDestinationFromTransition(transition);
    if (!destination) return;

    const isDestinationCoordinateValid = this.mapTiles.isCoordinateValid(
      destination.map,
      destination.gridX,
      destination.gridY
    );

    if (!isDestinationCoordinateValid) return;

    const isMapTemporarilyBlocked = this.mapTransitionValidator.isMapTemporarilyBlocked(destination, character);

    if (isMapTemporarilyBlocked) return;

    const checkHasEnoughSocialCrystalsIfRequired =
      await this.mapTransitionValidator.checkHasEnoughSocialCrystalsIfRequired(character, destination);

    if (!checkHasEnoughSocialCrystalsIfRequired) return;

    const verifyPremiumAccountAccess = await this.mapTransitionValidator.verifyPremiumAccountAccess(
      character,
      transition
    );

    if (!verifyPremiumAccountAccess) return;

    await this.teleportCharacter(character, destination);

    const guild = await this.guildTerritory.getGuildByTerritoryMap(destination.map);

    if (guild) {
      const lootShare = this.guildTerritory.getTerritoryLootShare(guild._id, destination.map);
      const lootShareMessage = lootShare ? ` Tributes may be charged on some loots (${lootShare}).` : "";

      this.socketMessaging.sendMessageToCharacter(
        character,
        `🏰 You have entered a guild controlled map: ${this.guildTerritory.getFormattedTerritoryName(
          destination.map
        )}.${lootShareMessage} 🏰`
      );
    }
  }

  public async teleportCharacter(character: ICharacter, destination: IDestination): Promise<void> {
    if (appEnv.general.IS_UNIT_TEST) {
      await this.execTeleportCharacter(character, destination);
      return;
    }

    await this.dynamicQueue.addJob(
      "map-transition",
      (job) => {
        const { character, destination } = job.data;

        void this.execTeleportCharacter(character, destination);
      },
      {
        character,
        destination,
      }
    );
  }

  public async execTeleportCharacter(character: ICharacter, destination: IDestination): Promise<void> {
    if (destination.map === character.scene) {
      await this.mapTransitionSameMap.sameMapTeleport(character, destination);
    } else {
      await this.mapTransitionDifferentMap.changeCharacterScene(character, destination);
    }
  }

  private getTransition(character: ICharacter, newX: number, newY: number): ITiledObject | undefined {
    const transition = this.mapTransitionInfo.getTransitionAtXY(character.scene, newX, newY);

    if (!transition) {
      return;
    }

    return transition;
  }

  private getDestinationFromTransition(transitionTiledObject: ITiledObject): IDestination | null {
    const map = this.mapTransitionInfo.getTransitionProperty(transitionTiledObject, "map");
    const gridX = Number(this.mapTransitionInfo.getTransitionProperty(transitionTiledObject, "gridX"));
    const gridY = Number(this.mapTransitionInfo.getTransitionProperty(transitionTiledObject, "gridY"));

    return map && gridX && gridY ? { map, gridX, gridY } : null;
  }
}
