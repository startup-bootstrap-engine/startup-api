import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { TrackClassExecutionTime } from "@jonit-dev/decorators-utils";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { ITEM_CONTAINER_ROLLBACK_MAX_TRIES } from "@providers/constants/ItemContainerConstants";
import { Locker } from "@providers/locks/Locker";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { provide } from "inversify-binding-decorators";

@TrackClassExecutionTime()
@provide(ItemContainerTransaction)
export class ItemContainerTransaction {
  constructor(
    private characterItemContainer: CharacterItemContainer,
    private characterItemSlots: CharacterItemSlots,
    private socketMessaging: SocketMessaging,
    private characterValidation: CharacterValidation,
    private locker: Locker
  ) {}

  @TrackNewRelicTransaction()
  public async transferToContainer(
    item: IItem,
    character: ICharacter,
    originContainer: IItemContainer,
    targetContainer: IItemContainer
  ): Promise<boolean> {
    try {
      const canProceed = await this.locker.lock(
        `${originContainer._id}-to-${targetContainer._id}-item-container-transfer`
      );

      if (!canProceed) {
        return false;
      }

      const isPreValidationSuccessful = await this.preValidateTransaction(
        character,
        originContainer,
        targetContainer,
        item
      );

      if (!isPreValidationSuccessful) {
        return false;
      }

      const addItemSuccessful = await this.characterItemContainer.addItemToContainer(
        item,
        character,
        targetContainer._id
      );

      if (!addItemSuccessful) {
        console.error("Failed to add item to target container.");
        return false;
      }

      const removeItemSuccessful = await this.characterItemContainer.removeItemFromContainer(
        item,
        character,
        originContainer
      );

      if (!removeItemSuccessful) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Failed to remove original item from origin container."
        );

        // Attempt rollback by removing the item from the target container
        const rollbackSuccessful = await this.retryOperation(async () => {
          return await this.characterItemContainer.removeItemFromContainer(item, character, targetContainer._id);
        });

        if (!rollbackSuccessful) {
          this.socketMessaging.sendErrorMessageToCharacter(
            character,
            "Failed to rollback item addition to target container. Please check your inventory."
          );
        }

        return false;
      }

      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      await this.locker.unlock(`${originContainer._id}-to-${targetContainer._id}-item-container-transfer`);
    }
  }

  private async retryOperation(operation: () => Promise<boolean>): Promise<boolean> {
    let attempt = 0;
    while (attempt < ITEM_CONTAINER_ROLLBACK_MAX_TRIES) {
      const success = await operation();
      if (success) return true;
      attempt++;
    }
    return false;
  }

  private async preValidateTransaction(
    character: ICharacter,
    originContainer: IItemContainer,
    targetContainer: IItemContainer,
    item: IItem
  ): Promise<boolean> {
    const hasBasicCharacterValidation = this.characterValidation.hasBasicValidation(character);

    if (!hasBasicCharacterValidation) {
      return false;
    }

    const doesOriginContainerExists = await ItemContainer.exists({ _id: originContainer._id, owner: character._id });

    if (!doesOriginContainerExists) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, the origin container wasn't found for this owner."
      );
      return false;
    }

    const doesTargetContainerExists = await ItemContainer.exists({ _id: targetContainer._id, owner: character._id });

    if (!doesTargetContainerExists) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, the target container wasn't found for this owner."
      );
      return false;
    }

    const hasSpace = await this.characterItemSlots.hasAvailableSlot(targetContainer._id, item, false);

    if (!hasSpace) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, your target container is full.");
      return false;
    }

    return true;
  }
}
