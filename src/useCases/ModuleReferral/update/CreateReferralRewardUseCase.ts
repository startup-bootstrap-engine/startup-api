import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { Request } from "express";
import { provide } from "inversify-binding-decorators";
import requestIp from "request-ip";
@provide(CreateReferralRewardUseCase)
export class CreateReferralRewardUseCase {
  constructor(
    private characterItemContainer: CharacterItemContainer,
    private characterInventory: CharacterInventory,
    private blueprintManager: BlueprintManager,
    private inMemoryHashTable: InMemoryHashTable
  ) {}

  public async awardReferralBonusToCharacter(characterId: string, amount: number): Promise<void> {
    try {
      const character = (await Character.findById(characterId).lean()) as ICharacter;

      if (!character) {
        throw new Error("Character not found");
      }

      const inventory = await this.characterInventory.getInventory(character);

      if (!inventory) {
        throw new Error("Inventory not found");
      }

      const inventoryContainer = await ItemContainer.findById(inventory.itemContainer).lean();

      if (!inventoryContainer) {
        throw new Error("Inventory container not found");
      }

      const socialCrystalItemBlueprint = (await this.blueprintManager.getBlueprint(
        "items",
        CraftingResourcesBlueprint.SocialCrystal
      )) as Partial<IItem>;

      const newItem = new Item({
        ...socialCrystalItemBlueprint,
        stackQty: amount,
      });

      await newItem.save();

      await this.characterItemContainer.addItemToContainer(newItem, character, inventoryContainer._id);
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  public async isReferralBonusAlreadyAdded(request: Request, deviceFingerprint: string): Promise<boolean> {
    try {
      const wasRequestIPAlreadyUsed = await this.wasRequestIPAlreadyUsed(request);

      if (wasRequestIPAlreadyUsed) {
        return true;
      }

      const wasDeviceFingerprintAlreadyUsed = await this.wasDeviceFingerprintAlreadyUsed(deviceFingerprint);

      if (wasDeviceFingerprintAlreadyUsed) {
        return true;
      }

      return false;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async wasDeviceFingerprintAlreadyUsed(deviceFingerprint: string): Promise<boolean> {
    if (!deviceFingerprint) {
      throw new Error("Invalid or missing device fingerprint");
    }

    if (!this.isValidFingerprint(Number(deviceFingerprint))) {
      throw new Error(`Invalid device fingerprint ${deviceFingerprint}.`);
    }

    const isDeviceFingerprintAdded = Boolean(
      await this.inMemoryHashTable.get("referral-bonus-device-fingerprint", deviceFingerprint)
    );

    if (isDeviceFingerprintAdded) {
      console.log(`Device fingerprint ${deviceFingerprint} already exists`);
      return true;
    }

    console.log(`Device fingerprint: ${deviceFingerprint} does not exist.`);
    await this.inMemoryHashTable.set("referral-bonus-device-fingerprint", deviceFingerprint, true);

    return false;
  }

  private async wasRequestIPAlreadyUsed(request: Request): Promise<boolean> {
    try {
      const clientIp = requestIp.getClientIp(request);

      if (!clientIp) {
        throw new Error("Invalid or missing client IP");
      }

      const isClientIpAdded = Boolean(await this.inMemoryHashTable.get("referral-bonus-ip", clientIp));

      if (isClientIpAdded) {
        console.log(`Client IP ${clientIp} already exists`);
        return true;
      }

      console.log(`Client IP ${clientIp} does not exist. Adding referral bonus`);

      await this.inMemoryHashTable.set("referral-bonus-ip", clientIp, true);

      return false;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private isValidFingerprint(n: number): boolean {
    // Define the limits for 32-bit unsigned integer
    const MIN: number = 0; // Minimum 32-bit unsigned integer
    const MAX: number = 4294967295; // Maximum 32-bit unsigned integer

    // Check if the number is an integer and within the 32-bit unsigned integer range
    if (Number.isInteger(n) && n >= MIN && n <= MAX) {
      return true;
    } else {
      return false;
    }
  }
}
