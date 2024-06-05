import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { NPC } from "@entities/ModuleNPC/NPCModel";
import { IUser } from "@entities/ModuleSystem/UserModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { BattleNetworkStopTargeting } from "@providers/battle/network/BattleNetworkStopTargetting";
import { CharacterUser } from "@providers/character/CharacterUser";
import { CharacterView } from "@providers/character/CharacterView";
import { TEMPORARILY_BLOCKED_MAPS } from "@providers/constants/MapConstants";
import { Locker } from "@providers/locks/Locker";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  BattleSocketEvents,
  FromGridX,
  IBattleCancelTargeting,
  IMapTransitionChangeMapPayload,
  ITiledObject,
  IViewDestroyElementPayload,
  MapSocketEvents,
  NPCAlignment,
  ViewSocketEvents,
} from "@rpg-engine/shared";
import { EntityType } from "@rpg-engine/shared/dist/types/entity.types";
import { provide } from "inversify-binding-decorators";
import { capitalize } from "lodash";
import { MapNonPVPZone } from "../MapNonPVPZone";
import { MapTransitionInfo } from "./MapTransitionInfo";
import { MapTransitionReferralBonus } from "./MapTransitionReferralBonus";

interface IDestination {
  map: string;
  gridX: number;
  gridY: number;
}

@provide(MapTransition)
export class MapTransition {
  constructor(
    private socketMessaging: SocketMessaging,
    private battleNetworkStopTargeting: BattleNetworkStopTargeting,
    private characterView: CharacterView,
    private locker: Locker,
    private mapTransitionInfo: MapTransitionInfo,
    private characterUser: CharacterUser,
    private mapNonPVPZone: MapNonPVPZone,
    private mapTransitionReferralBonus: MapTransitionReferralBonus
  ) {}

  @TrackNewRelicTransaction()
  public async handleMapTransition(character: ICharacter, newX: number, newY: number): Promise<void> {
    character = Object.freeze(character);

    const transition = this.getTransition(character, newX, newY);
    if (!transition) return;

    const destination = this.getDestinationFromTransition(transition);
    if (!destination) return;

    if (TEMPORARILY_BLOCKED_MAPS.includes(destination.map)) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "This map is temporarily blocked due to technical issues. Please try again later."
      );
      return;
    }

    const user = await this.getUser(character);
    const userAccountType = user?.accountType || "free";

    if (
      this.mapTransitionReferralBonus.isSocialCrystalsCheckRequired(userAccountType, character.scene, destination.map)
    ) {
      const hasEnoughCrystals = await this.mapTransitionReferralBonus.doesCharacterHasEnoughCrystals(
        character,
        destination.map
      );
      if (!hasEnoughCrystals) return;
    }

    if (this.isPremiumAccountRequired(transition) && !this.isUserAllowedAccess(transition, userAccountType)) {
      this.sendAccessErrorMessage(character, transition);
      return;
    }

    await this.teleportCharacter(character, destination);
  }

  private getTransition(character: ICharacter, newX: number, newY: number): ITiledObject | undefined {
    const transition = this.mapTransitionInfo.getTransitionAtXY(character.scene, newX, newY);

    if (!transition) {
      return;
    }

    return transition;
  }

  private async getUser(character: ICharacter): Promise<IUser | undefined> {
    const user = await this.characterUser.findUserByCharacter(character);
    if (!user) console.error("Failed to fetch user.");
    return user;
  }

  private async teleportCharacter(character: ICharacter, destination: IDestination): Promise<void> {
    if (destination.map === character.scene) {
      await this.sameMapTeleport(character, destination);
    } else {
      await this.changeCharacterScene(character, destination);
    }
  }

  private getDestinationFromTransition(transitionTiledObject: ITiledObject): IDestination | null {
    const map = this.mapTransitionInfo.getTransitionProperty(transitionTiledObject, "map");
    const gridX = Number(this.mapTransitionInfo.getTransitionProperty(transitionTiledObject, "gridX"));
    const gridY = Number(this.mapTransitionInfo.getTransitionProperty(transitionTiledObject, "gridY"));

    return map && gridX && gridY ? { map, gridX, gridY } : null;
  }

  private isPremiumAccountRequired(transitionTiledObj: ITiledObject): boolean {
    return Boolean(this.mapTransitionInfo.getTransitionProperty(transitionTiledObj, "accountType"));
  }

  private isUserAllowedAccess(transition: ITiledObject, userAccountType: string): boolean {
    const allowOnlyPremiumAccountType = this.mapTransitionInfo.getTransitionProperty(transition, "accountType");
    const allowedTypes = allowOnlyPremiumAccountType?.split(",").map((type) => type.trim());

    return allowedTypes?.includes(userAccountType) || false;
  }

  private sendAccessErrorMessage(character: ICharacter, transitionTiledObj: ITiledObject): void {
    const allowOnlyPremiumAccountType = this.mapTransitionInfo.getTransitionProperty(transitionTiledObj, "accountType");
    const allowedTypes = allowOnlyPremiumAccountType?.split(",").map((type) => type.trim());

    this.socketMessaging.sendErrorMessageToCharacter(
      character,
      `Sorry, a premium account of type '${allowedTypes
        ?.map((x) => `${capitalize(x)}`)
        .join(", or ")}' is required to access this area.`
    );
  }

  @TrackNewRelicTransaction()
  public async handleNonPVPZone(character: ICharacter, newX: number, newY: number): Promise<void> {
    if (!character.target?.id) {
      return;
    }

    if (String(character.target.type) === "NPC") {
      const npc = await NPC.findById(character.target.id).lean();

      if (npc?.alignment !== NPCAlignment.Friendly) {
        return;
      }
    }

    /* 
          Verify if we're in a non pvp zone. If so, we need to trigger 
          an attack stop event in case player was in a pvp combat
          */
    const nonPVPZone = this.mapNonPVPZone.isNonPVPZoneAtXY(character.scene, newX, newY);
    if (nonPVPZone) {
      this.mapNonPVPZone.stopCharacterAttack(character);
    }
  }

  @TrackNewRelicTransaction()
  public async changeCharacterScene(character: ICharacter, destination: IDestination): Promise<void> {
    try {
      const canProceed = await this.locker.lock(`character-changing-scene-${character._id}`, 1);

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

      await this.clearCharacterBattleTarget(character);

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
    }
  }

  @TrackNewRelicTransaction()
  public async sameMapTeleport(character: ICharacter, destination: IDestination): Promise<void> {
    try {
      const canProceed = await this.locker.lock(`character-changing-scene-${character._id}`, 1);

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

      await this.clearCharacterBattleTarget(character);

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
    }
  }

  private async clearCharacterBattleTarget(character: ICharacter): Promise<void> {
    if (character.target?.id && character.target?.type) {
      const targetId = character.target.id as unknown as string;
      const targetType = character.target.type as unknown as EntityType;
      const targetReason = "Your battle target was lost.";

      const dataOfCancelTargeting: IBattleCancelTargeting = {
        targetId: targetId,
        type: targetType,
        reason: targetReason,
      };

      this.socketMessaging.sendEventToUser<IBattleCancelTargeting>(
        character.channelId!,
        BattleSocketEvents.CancelTargeting,
        dataOfCancelTargeting
      );

      await this.battleNetworkStopTargeting.stopTargeting(character);
    }
  }
}
