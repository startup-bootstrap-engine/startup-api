import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { IMarketplaceMoney, MarketplaceMoney } from "@entities/ModuleMarketplace/MarketplaceMoneyModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterTradingBalance } from "@providers/character/CharacterTradingBalance";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { CharacterItemInventory } from "@providers/character/characterItems/CharacterItemInventory";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { CharacterWeightQueue } from "@providers/character/weight/CharacterWeightQueue";
import { blueprintManager } from "@providers/inversify/container";
import { OthersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { MathHelper } from "@providers/math/MathHelper";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  IEquipmentAndInventoryUpdatePayload,
  IItemContainer,
  ItemSocketEvents,
  MarketplaceSocketEvents,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { MarketplaceValidation } from "./MarketplaceValidation";

@provide(MarketplaceMoneyWithdraw)
export class MarketplaceMoneyWithdraw {
  constructor(
    private characterInventory: CharacterInventory,
    private characterItemContainer: CharacterItemContainer,
    private socketMessaging: SocketMessaging,
    private marketplaceValidation: MarketplaceValidation,
    private characterWeight: CharacterWeightQueue,
    private mathHelper: MathHelper,
    private characterItemSlots: CharacterItemSlots,
    private characterTradingBalance: CharacterTradingBalance,
    private characterItemInventory: CharacterItemInventory
  ) {}

  @TrackNewRelicTransaction()
  public async withdrawMoneyFromMarketplace(character: ICharacter, npcId: string): Promise<boolean> {
    const marketplaceValid = await this.marketplaceValidation.hasBasicValidation(character, npcId);
    if (!marketplaceValid) {
      return false;
    }

    const marketplaceMoney = await MarketplaceMoney.findOne({ owner: character._id });
    if (!marketplaceMoney || marketplaceMoney.money <= 0) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "You don't have gold in the marketplace");
      return false;
    }

    const added = await this.addGoldToInventory(character, marketplaceMoney);
    if (!added) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Could not add gold to inventory");
      return false;
    }

    this.socketMessaging.sendEventToUser(character.channelId!, MarketplaceSocketEvents.RefreshItems);
    await this.sendRefreshItemsEvent(character);

    return true;
  }

  @TrackNewRelicTransaction()
  public async getAvailableMoney(character: ICharacter): Promise<boolean> {
    const marketplaceMoney = await MarketplaceMoney.findOne({ owner: character._id });
    if (!marketplaceMoney) {
      return false;
    }

    const money = marketplaceMoney.money;

    this.socketMessaging.sendEventToUser(character.channelId!, "MarketplaceMoneyNotification", {
      moneyAvailable: money,
    });

    return true;
  }

  private async addGoldToInventory(character: ICharacter, marketplaceMoney: IMarketplaceMoney): Promise<boolean> {
    const blueprint = blueprintManager.getBlueprint<IItem>("items", OthersBlueprint.GoldCoin);
    const inventory = await this.characterInventory.getInventory(character);
    const inventoryContainerId = inventory?.itemContainer as unknown as string;

    const initialCharacterAvailableGold = await this.characterTradingBalance.getTotalGoldInInventory(character);

    let qty = marketplaceMoney.money;
    let moneyLeft = marketplaceMoney.money;

    while (qty > 0) {
      const newItem = new Item({ ...blueprint });

      const qtyToAdd = newItem.maxStackSize < qty ? newItem.maxStackSize : qty;
      const availableQtyOnFirstItemSlot = await this.characterItemSlots.getAvailableQuantityOnSlotToStack(
        inventoryContainerId,
        newItem.key,
        qtyToAdd
      );

      if (newItem.maxStackSize >= qty && availableQtyOnFirstItemSlot >= qty) {
        newItem.stackQty = qty;
        qty = 0;
      } else {
        newItem.stackQty = availableQtyOnFirstItemSlot;
        qty = this.mathHelper.fixPrecision(qty - newItem.stackQty);
      }

      await newItem.save();

      const wasAdded = await this.characterItemContainer.addItemToContainer(newItem, character, inventoryContainerId);

      if (wasAdded) {
        moneyLeft = qty;
      } else break;
    }
    const updatedGold = marketplaceMoney.money - moneyLeft;

    const isRollbackSuccessful = await this.checkAndRollbackMoneyWithdraw(
      character,
      blueprint,
      inventoryContainerId,
      updatedGold,
      initialCharacterAvailableGold
    );

    if (isRollbackSuccessful) {
      this.socketMessaging.sendMessageToCharacter(
        character,
        "Sorry, Withdrawal is not successful. Rollback to original state"
      );

      return false;
    }

    if (moneyLeft > 0) {
      await marketplaceMoney.updateOne({ money: moneyLeft });
    } else {
      await marketplaceMoney.remove();
    }

    await this.characterWeight.updateCharacterWeight(character);

    return true;
  }

  private async checkAndRollbackMoneyWithdraw(
    character: ICharacter,
    blueprint: IItem,
    inventoryContainerId: string,
    updatedGold: number,
    initialCharacterAvailableGold: number
  ): Promise<boolean> {
    const characterAvailableGold = await this.characterTradingBalance.getTotalGoldInInventory(character);

    if (initialCharacterAvailableGold + updatedGold !== characterAvailableGold) {
      if (initialCharacterAvailableGold === characterAvailableGold) {
        return true;
      }

      if (characterAvailableGold > initialCharacterAvailableGold) {
        const qty = characterAvailableGold - initialCharacterAvailableGold;
        await this.characterItemInventory.decrementItemFromNestedInventoryByKey(
          OthersBlueprint.GoldCoin,
          character,
          qty
        );
      } else {
        let qty = initialCharacterAvailableGold - characterAvailableGold;
        while (qty > 0) {
          const newItem = new Item({ ...blueprint });

          if (newItem.maxStackSize >= qty) {
            newItem.stackQty = qty;
            qty = 0;
          } else {
            newItem.stackQty = newItem.maxStackSize;
            qty = this.mathHelper.fixPrecision(qty - newItem.maxStackSize);
          }

          await newItem.save();

          await this.characterItemContainer.addItemToContainer(newItem, character, inventoryContainerId);
        }
      }

      return true;
    }

    return false;
  }

  private async sendRefreshItemsEvent(character: ICharacter): Promise<void> {
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
