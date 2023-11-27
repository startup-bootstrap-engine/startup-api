import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Item } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { provide } from "inversify-binding-decorators";

@provide(PremiumAccountUseCase)
export class PremiumAccountUseCase {
  constructor(
    private characterInventory: CharacterInventory,
    private characterItemContainer: CharacterItemContainer,
    private blueprintManager: BlueprintManager
  ) {}

  public async createItemToCharacter(blueprintKey: string, characterId: string, quantity: number): Promise<void> {
    try {
      const character = (await Character.findOne({ _id: characterId }).lean()) as ICharacter;

      if (!character) {
        throw new BadRequestError("Character not found");
      }

      const inventory = await this.characterInventory.getInventory(character);

      if (!inventory) {
        throw new BadRequestError("Character inventory not found");
      }

      const inventoryContainerId = inventory.itemContainer?.toString();

      if (!inventoryContainerId) {
        throw new BadRequestError("Character inventory container not found");
      }

      const itemBlueprint = (await this.blueprintManager.getBlueprint("items", blueprintKey)) as Record<
        string,
        unknown
      >;

      if (!itemBlueprint) {
        throw new BadRequestError("Item blueprint not found");
      }

      const item = new Item({
        ...itemBlueprint,
        stackQty: quantity,
      });

      await item.save();

      const result = await this.characterItemContainer.addItemToContainer(item, character, inventoryContainerId, {
        shouldAddOwnership: true,
        shouldAddAsCarriedItem: true,
      });

      if (!result) {
        throw new BadRequestError("Item could not be added to character");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
