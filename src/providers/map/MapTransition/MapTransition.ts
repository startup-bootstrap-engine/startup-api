import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterUser } from "@providers/character/CharacterUser";
import { ITiledObject } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { MapNonPVPZone } from "../MapNonPVPZone";
import { MapTransitionDifferentMap } from "./MapTransitionDifferentMap";
import { MapTransitionInfo } from "./MapTransitionInfo";
import { MapTransitionSameMap } from "./MapTransitionSameMap";
import { MapTransitionValidator } from "./MapTransitionValidator";

export interface IDestination {
  map: string;
  gridX: number;
  gridY: number;
}

@provide(MapTransition)
export class MapTransition {
  constructor(
    private mapTransitionInfo: MapTransitionInfo,
    private characterUser: CharacterUser,
    private mapNonPVPZone: MapNonPVPZone,
    private mapTransitionSameMap: MapTransitionSameMap,
    private mapTransitionDifferentMap: MapTransitionDifferentMap,
    private mapTransitionValidator: MapTransitionValidator
  ) {}

  @TrackNewRelicTransaction()
  public async handleMapTransition(character: ICharacter, newX: number, newY: number): Promise<void> {
    const transition = this.getTransition(character, newX, newY);
    if (!transition) return;

    const destination = this.getDestinationFromTransition(transition);
    if (!destination) return;

    const isMapTemporarilyBlocked = await this.mapTransitionValidator.isMapTemporarilyBlocked(destination, character);

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
  }

  public async teleportCharacter(character: ICharacter, destination: IDestination): Promise<void> {
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
