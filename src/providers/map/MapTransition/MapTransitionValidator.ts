import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { ITiledObject } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { capitalize } from "lodash";
import { MapTransitionInfo } from "./MapTransitionInfo";

@provide(MapTransitionValidator)
export class MapTransitionValidator {
  constructor(private socketMessaging: SocketMessaging, private mapTransitionInfo: MapTransitionInfo) {}

  public isPremiumAccountRequired(transitionTiledObj: ITiledObject): boolean {
    return Boolean(this.mapTransitionInfo.getTransitionProperty(transitionTiledObj, "accountType"));
  }

  public isUserAllowedAccess(transition: ITiledObject, userAccountType: string): boolean {
    const allowOnlyPremiumAccountType = this.mapTransitionInfo.getTransitionProperty(transition, "accountType");
    const allowedTypes = allowOnlyPremiumAccountType?.split(",").map((type) => type.trim());

    return allowedTypes?.includes(userAccountType) || false;
  }

  public sendAccessErrorMessage(character: ICharacter, transitionTiledObj: ITiledObject): void {
    const allowOnlyPremiumAccountType = this.mapTransitionInfo.getTransitionProperty(transitionTiledObj, "accountType");
    const allowedTypes = allowOnlyPremiumAccountType?.split(",").map((type) => type.trim());

    this.socketMessaging.sendErrorMessageToCharacter(
      character,
      `Sorry, a premium account of type '${allowedTypes
        ?.map((x) => `${capitalize(x)}`)
        .join(", or ")}' is required to access this area.`
    );
  }
}
