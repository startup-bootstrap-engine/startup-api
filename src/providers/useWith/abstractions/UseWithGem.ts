import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { GemAttachToEquip } from "@providers/gem/GemAttachToEquip";
import { container } from "@providers/inversify/container";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IItemGem } from "@rpg-engine/shared";

import { provide } from "inversify-binding-decorators";

@provide(UseWithGem)
export class UseWithGem {
  constructor(
    private socketMessaging: SocketMessaging,

    private gemAttachToEquip: GemAttachToEquip
  ) {}

  public async execute(originItem: IItem, targetItem: IItem, character: ICharacter): Promise<void> {
    const blueprintManager = container.get<BlueprintManager>(BlueprintManager);

    const originItemBlueprint = (await blueprintManager.getBlueprint("items", originItem.key)) as IItemGem;

    if (!originItemBlueprint) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, failed to fetch origin item blueprint.");
      return;
    }

    await this.gemAttachToEquip.attachGemToEquip(originItem, targetItem, character);
  }
}
