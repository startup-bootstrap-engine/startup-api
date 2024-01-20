import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { Item } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemInventory } from "@providers/character/characterItems/CharacterItemInventory";
import { CharacterWeight } from "@providers/character/weight/CharacterWeight";
import { container } from "@providers/inversify/container";

import { IPosition } from "@providers/movement/MovementHelper";
import { IPlantItem } from "@providers/plant/data/blueprints/PlantItem";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IEquipmentAndInventoryUpdatePayload, IItemContainer, ItemSocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

export interface IUseWithItemToSeedOptions {
  map: string;
  coordinates: IPosition;
  key: string;
  originItemKey: string;
  successMessage: string;
  errorMessage: string;
}

@provide(UseWithItemToSeed)
export class UseWithItemToSeed {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterItemInventory: CharacterItemInventory,
    private characterWeight: CharacterWeight,
    private characterInventory: CharacterInventory
  ) {}

  public async execute(
    character: ICharacter,
    options: IUseWithItemToSeedOptions,
    skillIncrease: SkillIncrease
  ): Promise<void> {
    const { map, coordinates, key, originItemKey, successMessage, errorMessage } = options;
    const blueprintManager = container.get<BlueprintManager>(BlueprintManager);

    try {
      const blueprint = (await blueprintManager.getBlueprint("plants", key)) as IPlantItem;

      if (!blueprint) {
        throw new Error(`Cannot find blueprint for key '${key}'`);
      }

      const plantData = {
        ...blueprint,
        key,
        x: coordinates.x,
        y: coordinates.y,
        scene: map,
        owner: character.id,
      };

      const newPlant = new Item(plantData);
      await newPlant.save();

      await this.characterItemInventory.decrementItemFromInventoryByKey(originItemKey, character, 1);
      await this.characterWeight.updateCharacterWeight(character);

      this.socketMessaging.sendMessageToCharacter(character, successMessage);

      await this.refreshInventory(character);
    } catch (error) {
      this.socketMessaging.sendErrorMessageToCharacter(character, errorMessage);
    }
  }

  private async refreshInventory(character: ICharacter): Promise<void> {
    const inventory = await this.characterInventory.getInventory(character);
    const inventoryContainer = (await ItemContainer.findById(inventory?.itemContainer)) as unknown as IItemContainer;

    const payloadUpdate: IEquipmentAndInventoryUpdatePayload = {
      inventory: inventoryContainer,
      openEquipmentSetOnUpdate: false,
      openInventoryOnUpdate: true,
    };

    this.socketMessaging.sendEventToUser<IEquipmentAndInventoryUpdatePayload>(
      character.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      payloadUpdate
    );
  }
}
