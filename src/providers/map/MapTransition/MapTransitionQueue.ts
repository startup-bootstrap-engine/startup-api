import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { GuildTerritory } from "@providers/guild/GuildTerritory";
import { Locker } from "@providers/locks/Locker";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { Cooldown } from "@providers/time/Cooldown";
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
    private socketMessaging: SocketMessaging,
    private cooldown: Cooldown,
    private locker: Locker
  ) {}

  @TrackNewRelicTransaction()
  public async handleMapTransition(character: ICharacter, newX: number, newY: number): Promise<boolean> {
    try {
      const transition = this.getTransition(character, newX, newY);
      if (!transition) {
        return false;
      }

      const destination = this.getDestinationFromTransition(transition);
      if (!destination) {
        return false;
      }

      const isDestinationCoordinateValid = this.mapTiles.isMapCoordinateWithinBounds(
        destination.map,
        destination.gridX,
        destination.gridY
      );

      if (!isDestinationCoordinateValid) {
        console.error(
          `Invalid destination coordinate - out of bounds: ${destination.map} ${destination.gridX} ${destination.gridY}`
        );
        return false;
      }

      const isMapTemporarilyBlocked = this.mapTransitionValidator.isMapTemporarilyBlocked(destination, character);

      if (isMapTemporarilyBlocked) {
        return false;
      }

      const checkHasEnoughSocialCrystalsIfRequired =
        await this.mapTransitionValidator.checkHasEnoughSocialCrystalsIfRequired(character, destination);

      if (!checkHasEnoughSocialCrystalsIfRequired) {
        return false;
      }

      const verifyPremiumAccountAccess = await this.mapTransitionValidator.verifyPremiumAccountAccess(
        character,
        transition
      );

      if (!verifyPremiumAccountAccess) {
        return false;
      }

      await this.teleportCharacter(character, destination);

      const guild = await this.guildTerritory.getGuildByTerritoryMap(destination.map);

      if (guild) {
        const guildWarningKey = `${character._id}-${destination.map}`;
        const isOnCooldown = await this.cooldown.isOnCooldown(guildWarningKey);

        if (!isOnCooldown) {
          const lootShare = this.guildTerritory.getTerritoryLootShare(guild, destination.map);
          const lootShareMessage = lootShare ? ` Tributes may be charged on some loots (${lootShare}%).` : "";

          console.log(lootShare, lootShareMessage);

          this.socketMessaging.sendMessageToCharacter(
            character,
            `🏰 You have entered ${this.guildTerritory.getFormattedTerritoryName(
              destination.map
            )}, controlled by guild ${guild.name}.${lootShareMessage} 🏰`
          );

          // Set a cooldown of 5 minutes (300 seconds)
          await this.cooldown.setCooldown(guildWarningKey, 300);
        }
      }

      return true;
    } catch (error) {
      console.error(error);

      return false;
    }
  }

  public async teleportCharacter(character: ICharacter, destination: IDestination): Promise<void> {
    const canProceed = await this.locker.lock(`character-changing-scene-${character._id}`);

    if (!canProceed) {
      return;
    }

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
