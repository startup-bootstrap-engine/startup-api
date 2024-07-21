import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { NPC } from "@entities/ModuleNPC/NPCModel";
import { IUser } from "@entities/ModuleSystem/UserModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterUser } from "@providers/character/CharacterUser";
import { TEMPORARILY_BLOCKED_MAPS } from "@providers/constants/MapConstants";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { ITiledObject, NPCAlignment } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { capitalize } from "lodash";
import { MapNonPVPZone } from "../MapNonPVPZone";
import { MapTransitionDifferentMap } from "./MapTransitionDifferentMap";
import { MapTransitionInfo } from "./MapTransitionInfo";
import { MapTransitionReferralBonus } from "./MapTransitionReferralBonus";
import { MapTransitionSameMap } from "./MapTransitionSameMap";

export interface IDestination {
  map: string;
  gridX: number;
  gridY: number;
}

@provide(MapTransition)
export class MapTransition {
  constructor(
    private socketMessaging: SocketMessaging,
    private mapTransitionInfo: MapTransitionInfo,
    private characterUser: CharacterUser,
    private mapNonPVPZone: MapNonPVPZone,
    private mapTransitionReferralBonus: MapTransitionReferralBonus,
    private mapTransitionSameMap: MapTransitionSameMap,
    private mapTransitionDifferentMap: MapTransitionDifferentMap
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
      await this.mapTransitionSameMap.sameMapTeleport(character, destination);
    } else {
      await this.mapTransitionDifferentMap.changeCharacterScene(character, destination);
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
}
