import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Depot } from "@entities/ModuleDepot/DepotModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { Item } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { provide } from "inversify-binding-decorators";

@provide(PremiumAccountUseCase)
export class PremiumAccountUseCase {
  constructor(
    private characterInventory: CharacterInventory,
    private characterItemContainer: CharacterItemContainer,
    private blueprintManager: BlueprintManager,
    private inMemoryHashTable: InMemoryHashTable
  ) {}

  public async createExtraDepotSlots(characterId: string, depotCity: string, slotQtyToAdd: number): Promise<void> {
    try {
      const bankerCityMapping = {
        shadowlands: "banker-603",
        ilya: "banker-770",
      };

      if (!bankerCityMapping[depotCity]) {
        throw new BadRequestError("Invalid depot city");
      }

      const depot = await Depot.findOne({ owner: characterId, key: bankerCityMapping[depotCity] })
        .lean()
        .select("itemContainer");

      if (!depot) {
        throw new BadRequestError("Depot not found");
      }

      const itemContainer = await ItemContainer.findOne({ _id: depot.itemContainer }).lean();

      if (!itemContainer) {
        throw new BadRequestError("Item container not found");
      }

      const newSlotQty = itemContainer.slotQty + slotQtyToAdd;

      const previousSlots = itemContainer.slots;

      // Update slots
      for (let i = itemContainer.slotQty; i < newSlotQty; i++) {
        if (itemContainer.slots[i] === undefined) {
          itemContainer.slots[i] = null;
        }
      }

      // Persist changes
      await ItemContainer.updateOne(
        { _id: itemContainer._id },
        {
          $set: {
            slotQty: newSlotQty,
            slots: {
              ...previousSlots,
              ...itemContainer.slots,
            },
          },
        }
      );

      await this.inMemoryHashTable.delete("container-all-items", itemContainer._id.toString()!);
    } catch (error) {
      console.error(error);
    }
  }

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
        owner: characterId,
      });

      await item.save();

      const result = await this.characterItemContainer.addItemToContainer(item, character, inventoryContainerId, {
        shouldAddOwnership: true,
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
