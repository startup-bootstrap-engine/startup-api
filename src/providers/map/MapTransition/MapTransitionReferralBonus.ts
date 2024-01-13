import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemInventory } from "@providers/character/characterItems/CharacterItemInventory";
import { CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { UserAccountTypes } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { MapTransitionInfo } from "./MapTransitionInfo";

@provide(MapTransitionReferralBonus)
export class MapTransitionReferralBonus {
  constructor(
    private socketMessaging: SocketMessaging,
    private mapTransitionInfo: MapTransitionInfo,
    private characterItemInventory: CharacterItemInventory,
    private characterInventory: CharacterInventory
  ) {}

  public isSocialCrystalsCheckRequired(userAccountType: string, currentMap: string, destinationMap: string): boolean {
    const isFreeAccount = userAccountType === UserAccountTypes.Free;
    const isCurrentMapFree = this.mapTransitionInfo.getTransitionSocialCrystalPrice(currentMap) === 0;
    const areSocialCrystalsRequired = this.mapTransitionInfo.getTransitionSocialCrystalPrice(destinationMap) > 0;
    return areSocialCrystalsRequired && isFreeAccount && isCurrentMapFree;
  }

  public async doesCharacterHasEnoughCrystals(character: ICharacter, destinationMap: string): Promise<boolean> {
    const socialCrystalsDestinationPrice = this.mapTransitionInfo.getTransitionSocialCrystalPrice(destinationMap);
    const inventoryContainer = await this.characterInventory.getInventoryItemContainer(character);

    if (!inventoryContainer) {
      return false;
    }

    const socialCrystalsQty = await this.characterItemInventory.countItemInNestedContainers(
      inventoryContainer,
      CraftingResourcesBlueprint.SocialCrystal
    );

    if (!this.hasRequiredSocialCrystalsQty(socialCrystalsQty, socialCrystalsDestinationPrice)) {
      this.sendErrorMessage(character, socialCrystalsQty, socialCrystalsDestinationPrice);
      return false;
    }

    // tries to decrement...
    const result = await this.characterItemInventory.decrementItemFromNestedInventoryByKey(
      CraftingResourcesBlueprint.SocialCrystal,
      character,
      socialCrystalsDestinationPrice
    );

    if (!result.success) {
      this.sendErrorMessage(character, socialCrystalsQty, socialCrystalsDestinationPrice);
      return false;
    }

    return true;
  }

  private hasRequiredSocialCrystalsQty(socialCrystalsQty: number, requiredQty: number): boolean {
    return socialCrystalsQty >= requiredQty;
  }

  private sendErrorMessage(character: ICharacter, currentQty: number, requiredQty: number): void {
    const message =
      currentQty === 0
        ? `Sorry, you have no social crystals, but you need ${requiredQty} to teleport to this area, or a premium account.`
        : `Sorry, you have only ${currentQty} social crystals, but you need ${requiredQty} to teleport to this area, or a premium account.`;

    this.socketMessaging.sendErrorMessageToCharacter(character, message);
  }
}
