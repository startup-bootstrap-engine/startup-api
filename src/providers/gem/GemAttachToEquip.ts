import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CharacterItemInventory } from "@providers/character/characterItems/CharacterItemInventory";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IItemGem, ItemSubType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(GemAttachToEquip)
export class GemAttachToEquip {
  constructor(
    private characterValidation: CharacterValidation,
    private socketMessaging: SocketMessaging,
    private blueprintManager: BlueprintManager,
    private characterItemInventory: CharacterItemInventory
  ) {}

  public async attachGemToEquip(originItem: IItem, targetItem: IItem, character: ICharacter): Promise<boolean> {
    const gemItemBlueprint = await this.blueprintManager.getBlueprint<IItemGem>("items", originItem.key);

    const isValid = await this.isValid(gemItemBlueprint, originItem, targetItem, character);

    if (!isValid) {
      return false;
    }

    const wasGemConsumed = await this.characterItemInventory.deleteItemFromInventory(originItem._id, character);

    if (!wasGemConsumed) {
      return false;
    }

    // delete database gem representation
    await Item.findByIdAndDelete(originItem._id);

    if (gemItemBlueprint.gemStatBuff) {
      await this.attachGemStatBuffToEquip(gemItemBlueprint, targetItem);
    }

    if (gemItemBlueprint.gemEntityEffectsAdd) {
      await this.attachGemEntityEffectsToEquip(gemItemBlueprint, targetItem);
    }

    this.sendSuccessMessage(character, gemItemBlueprint, originItem, targetItem);

    return true;
  }

  private sendSuccessMessage(
    character: ICharacter,
    gemItemBlueprint: IItemGem,
    originItem: IItem,
    targetItem: IItem
  ): void {
    let message = `Attached '${originItem.name}' to ${targetItem.name}.`;

    if (gemItemBlueprint.gemStatBuff) {
      const { attack = 0, defense = 0 } = gemItemBlueprint.gemStatBuff;
      if (attack > 0 || defense > 0) {
        message += ` Increased stats by: ${attack > 0 ? `+${attack} attack` : ""}${
          defense > 0 ? `, +${defense} defense` : ""
        }.`;
      }
    }

    if (gemItemBlueprint.gemEntityEffectsAdd && gemItemBlueprint.gemEntityEffectsAdd.length > 0) {
      message += ` Added effects: ${gemItemBlueprint.gemEntityEffectsAdd.join(", ")}.`;
    }

    this.socketMessaging.sendMessageToCharacter(character, message);
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
