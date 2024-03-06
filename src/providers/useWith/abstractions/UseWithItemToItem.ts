import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Item } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CharacterItemInventory } from "@providers/character/characterItems/CharacterItemInventory";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { IItem, IUseWithItem, IUseWithItemBlueprint, UseWithSocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(UseWithItemToItem)
export class UseWithItemToItem {
  constructor(
    private socketAuth: SocketAuth,
    private characterValidation: CharacterValidation,
    private socketMessaging: SocketMessaging,
    private characterItemInventory: CharacterItemInventory,
    private blueprintManager: BlueprintManager
  ) {}

  public onUseWithItemToItem(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(channel, UseWithSocketEvents.UseWithItem, async (data: IUseWithItem, character) => {
      const originItemBlueprint = (await this.blueprintManager.getBlueprint(
        "items",
        data.originItemId
      )) as IUseWithItemBlueprint;

      await this.execute(character, data, originItemBlueprint);
    });
  }

  public async execute(
    character: ICharacter,
    data: IUseWithItem,
    originItemBlueprint: IUseWithItemBlueprint
  ): Promise<void> {
    try {
      const validateData = await this.validateData(character, data, originItemBlueprint);

      if (!validateData) {
        return;
      }

      const originItem = (await Item.findById(data.originItemId).lean({ virtuals: true, defaults: true })) as IItem;
      const targetItem = (await Item.findById(data.targetItemId).lean({ virtuals: true, defaults: true })) as IItem;

      if (!originItem) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Sorry, failed to fetch origin item required information."
        );
        return;
      }

      if (!targetItem) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Sorry, failed to fetch target item required information."
        );
        return;
      }

      await originItemBlueprint.useWithItemEffect!(originItem, targetItem, character as any);
    } catch (error) {
      console.error(error);
    }
  }

  private async validateData(
    character: ICharacter,
    data: IUseWithItem,
    originItemBlueprint: IUseWithItemBlueprint
  ): Promise<boolean> {
    const isCharacterValid = await this.characterValidation.hasBasicValidation(character);

    if (!isCharacterValid) {
      return false;
    }

    const { originItemId, targetItemId } = data;
    const hasOriginItem = await this.characterItemInventory.checkItemInInventory(originItemId, character);
    const hasTargetItem = await this.characterItemInventory.checkItemInInventory(targetItemId, character);

    if (!hasOriginItem) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, the origin item you selected is not on the inventory."
      );
      return false;
    }

    if (!hasTargetItem) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, the target item you selected is not on your the inventory."
      );
      return false;
    }

    if (!originItemBlueprint) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, failed to fetch origin item required information."
      );
      return false;
    }

    const useWithItemEffect = originItemBlueprint.useWithItemEffect;

    if (!useWithItemEffect) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        `Sorry, the origin item ${originItemBlueprint.name} does not have an effect set.`
      );
      return false;
    }

    return true;
  }
}
