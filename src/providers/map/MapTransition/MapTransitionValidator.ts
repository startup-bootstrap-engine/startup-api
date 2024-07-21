import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IUser } from "@entities/ModuleSystem/UserModel";
import { CharacterUser } from "@providers/character/CharacterUser";
import { TEMPORARILY_BLOCKED_MAPS } from "@providers/constants/MapConstants";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { ITiledObject } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { capitalize } from "lodash";
import { IDestination } from "./MapTransition";
import { MapTransitionInfo } from "./MapTransitionInfo";
import { MapTransitionReferralBonus } from "./MapTransitionReferralBonus"; // Assuming MapTransitionReferralBonus exists

@provide(MapTransitionValidator)
export class MapTransitionValidator {
  constructor(
    private socketMessaging: SocketMessaging,
    private mapTransitionInfo: MapTransitionInfo,
    private mapTransitionReferralBonus: MapTransitionReferralBonus,
    private characterUser: CharacterUser
  ) {}

  public isMapTemporarilyBlocked(destination: IDestination, character: ICharacter): boolean {
    if (TEMPORARILY_BLOCKED_MAPS.includes(destination.map)) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "This map is temporarily blocked due to technical issues. Please try again later."
      );
      return true;
    }
    return false;
  }

  public async checkHasEnoughSocialCrystalsIfRequired(
    character: ICharacter,
    destination: IDestination
  ): Promise<boolean> {
    const user = await this.getUser(character);
    const userAccountType = user?.accountType || "free";

    if (
      this.mapTransitionReferralBonus.isSocialCrystalsCheckRequired(userAccountType, character.scene, destination.map)
    ) {
      const hasEnoughCrystals = await this.mapTransitionReferralBonus.doesCharacterHasEnoughCrystals(
        character,
        destination.map
      );
      if (!hasEnoughCrystals) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "You do not have enough social crystals to proceed to this map."
        );
        return false;
      }
    }

    return true;
  }

  public async verifyPremiumAccountAccess(character: ICharacter, transition: ITiledObject): Promise<boolean> {
    try {
      const user = (await this.getUser(character)) as IUser;

      if (!user) {
        throw new Error("Failed to fetch user.");
      }

      const userAccountType = user.accountType || "free";

      if (this.isPremiumAccountRequired(transition) && !this.isUserAllowedAccess(transition, userAccountType)) {
        this.sendAccessErrorMessage(character, transition);
        return false;
      }

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public isPremiumAccountRequired(transitionTiledObj: ITiledObject): boolean {
    return Boolean(this.mapTransitionInfo.getTransitionProperty(transitionTiledObj, "accountType"));
  }

  public isUserAllowedAccess(transition: ITiledObject, userAccountType: string): boolean {
    const allowOnlyPremiumAccountType = this.mapTransitionInfo.getTransitionProperty(transition, "accountType");
    const allowedTypes = allowOnlyPremiumAccountType?.split(",").map((type) => type.trim());

    return allowedTypes ? allowedTypes.includes(userAccountType) : true;
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

  private async getUser(character: ICharacter): Promise<IUser | undefined> {
    const user = await this.characterUser.findUserByCharacter(character);
    if (!user) console.error("Failed to fetch user.");
    return user;
  }
}
