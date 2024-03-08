import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IItemGem, ItemSubType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(GemAttachToEquip)
export class GemAttachToEquip {
  constructor(
    private characterValidation: CharacterValidation,
    private socketMessaging: SocketMessaging,
    private blueprintManager: BlueprintManager
  ) {}

  public async attachGemToEquip(originItem: IItem, targetItem: IItem, character: ICharacter): Promise<boolean> {
    const gemItemBlueprint = await this.blueprintManager.getBlueprint<IItemGem>("items", originItem.key);

    const isValid = await this.isValid(gemItemBlueprint, originItem, targetItem, character);

    if (!isValid) {
      return false;
    }

    if (gemItemBlueprint.gemStatBuff) {
      await this.attachGemStatBuffToEquip(gemItemBlueprint, targetItem);
    }

    if (gemItemBlueprint.gemEntityEffectsAdd) {
      await this.attachGemEntityEffectsToEquip(gemItemBlueprint, targetItem);
    }

    this.socketMessaging.sendMessageToCharacter(
      character,
      `You have successfully attached '${originItem.name}' to your ${targetItem.name}. `
    );

    return true;
  }

  private async attachGemStatBuffToEquip(gemItemBlueprint: IItemGem, targetItem: IItem): Promise<void> {
    await Item.findByIdAndUpdate(targetItem._id, {
      $inc: {
        attack: gemItemBlueprint.gemStatBuff?.attack,
        defense: gemItemBlueprint.gemStatBuff?.defense,
      },
    });
  }

  private async attachGemEntityEffectsToEquip(gemItemBlueprint: IItemGem, targetItem: IItem): Promise<void> {
    await Item.findByIdAndUpdate(targetItem._id, {
      $addToSet: {
        entityEffects: {
          $each: gemItemBlueprint.gemEntityEffectsAdd,
        },
      },
    });
  }

  private isValid(gemItemBlueprint: IItemGem, originItem: IItem, targetItem: IItem, character: ICharacter): boolean {
    const isCharacterValid = this.characterValidation.hasBasicValidation(character);

    if (!isCharacterValid) {
      return false;
    }

    if (gemItemBlueprint.subType !== ItemSubType.Gem) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you can only attach gems to equipment.");
      return false;
    }

    const doesCharacterOwnsGemItem = String(originItem.owner) === String(character._id);
    const doesCharacterOwnsTargetItem = String(targetItem.owner) === String(character._id);

    if (!doesCharacterOwnsGemItem) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you don't own this gem.");
      return false;
    }

    if (!doesCharacterOwnsTargetItem) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you don't own this equipment.");
      return false;
    }

    return true;
  }
}
