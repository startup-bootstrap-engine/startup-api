import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IItemGem, ItemSubType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(GemAttachToEquip)
export class GemAttachToEquip {
  constructor(private characterValidation: CharacterValidation, private socketMessaging: SocketMessaging) {}

  public async attachGemToEquip(gemItem: IItemGem, targetItem: IItem, character: ICharacter): Promise<void> {
    const isValid = await this.isValid(gemItem, targetItem, character);

    if (!isValid) {
      return;
    }

    if (gemItem.gemStatBuff) {
      await this.attachGemStatBuffToEquip(gemItem, targetItem, character);
    }

    if (gemItem.gemEntityEffectsAdd) {
      await this.attachGemEntityEffectsToEquip(gemItem, targetItem, character);
    }

    if (gemItem.gemEquippedBuffAdd) {
      await this.attachGemEquippedBuffToEquip(gemItem, targetItem, character);
    }
  }

  private async attachGemStatBuffToEquip(gemItem: IItemGem, targetItem: IItem, character: ICharacter): Promise<void> {}

  private async attachGemEntityEffectsToEquip(
    gemItem: IItemGem,
    targetItem: IItem,
    character: ICharacter
  ): Promise<void> {}

  private async attachGemEquippedBuffToEquip(
    gemItem: IItemGem,
    targetItem: IItem,
    character: ICharacter
  ): Promise<void> {}

  private isValid(gemItem: IItemGem, targetItem: IItem, character: ICharacter): boolean {
    if (gemItem.subType !== ItemSubType.Gem) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you can only attach gems to equipment.");
      return false;
    }

    return true;
  }
}
