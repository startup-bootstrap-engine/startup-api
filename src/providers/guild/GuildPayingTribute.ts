import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { IGuild } from "@entities/ModuleSystem/GuildModel";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { blueprintManager } from "@providers/inversify/container";
import { OthersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { provide } from "inversify-binding-decorators";
import _ from "lodash";
import { GuildCommon } from "./GuildCommon";
import { GuildLeader } from "./GuildLeader";
import { GuildTerritory } from "./GuildTerritory";

const LOOT_CHANCE_THRESHOLD = 70;
const MIN_LOOT_AMOUNT = 1;

@provide(GuildPayingTribute)
export class GuildPayingTribute {
  constructor(
    private guildTerritory: GuildTerritory,
    private socketMessaging: SocketMessaging,
    private guildCommon: GuildCommon,
    private characterItemContainer: CharacterItemContainer,
    private guildLeader: GuildLeader,
    private characterItemSlots: CharacterItemSlots
  ) {}

  public async payTribute(character: ICharacter, item: IItem): Promise<number> {
    try {
      const mapName = character.scene;
      const guild = await this.guildTerritory.getGuildByTerritoryMap(mapName);
      if (!guild) {
        return item.stackQty!;
      }

      const characterGuild = await this.guildCommon.getCharactersGuild(character);
      if (characterGuild && characterGuild._id.toString() === guild._id.toString()) {
        return item.stackQty!;
      }

      const territory = guild.territoriesOwned.find((t) => t.map && t.map === mapName);
      if (!territory || !item.stackQty) {
        return item.stackQty!;
      }

      const lootShare = territory.lootShare;
      const maxLootShare = this.calculateMaxLootShare(item.stackQty, lootShare);
      const lootAmount = this.calculateLootAmount(item, maxLootShare);

      if (lootAmount > 0 && lootAmount <= item.stackQty) {
        await this.processTributePayment(character, item, guild, lootAmount);
        return item.stackQty! - lootAmount;
      }

      return item.stackQty!;
    } catch (error) {
      console.error("Error paying tribute:", error);
      return item.stackQty!;
    }
  }

  private calculateMaxLootShare(stackQty: number, lootShare: number): number {
    return Math.round((stackQty / 100) * lootShare);
  }

  private calculateLootAmount(item: IItem, maxLootShare: number): number {
    const calculateAmount = (): number =>
      Math.max(MIN_LOOT_AMOUNT, _.random(MIN_LOOT_AMOUNT, Math.min(maxLootShare, item.stackQty || MIN_LOOT_AMOUNT)));

    if (item.key === OthersBlueprint.GoldCoin) {
      return calculateAmount();
    } else {
      const random = _.random(0, 100);
      return random > LOOT_CHANCE_THRESHOLD ? 0 : calculateAmount();
    }
  }

  private async processTributePayment(
    character: ICharacter,
    item: IItem,
    guild: IGuild,
    lootAmount: number
  ): Promise<void> {
    const updatedStackQty = item.stackQty! - lootAmount;
    await Item.updateOne({ _id: item._id }, { stackQty: updatedStackQty });

    if (!guild?._id) {
      throw new Error("Guild not found");
    }

    const guildLeaderItemContainer = await this.tryToFetchGuildLeaderInventoryOrDepot(guild, item);

    const guildLeader = await this.guildLeader.getGuildLeaderById(guild._id);

    if (!guildLeaderItemContainer) {
      this.socketMessaging.sendErrorMessageToCharacter(
        guildLeader,
        "Sorry, your tribute can't be paid because you have no space on your inventory or depot."
      );
      return;
    }

    const blueprint = await blueprintManager.getBlueprint<IItem>("items", item.key);
    const newItem = (await Item.create({
      ...blueprint,
      stackQty: lootAmount,
    })) as IItem;

    if (guildLeaderItemContainer) {
      await this.characterItemContainer.addItemToContainer(newItem, guildLeader, guildLeaderItemContainer._id);
    }

    const itemName = item.key === OthersBlueprint.GoldCoin ? "Gold Coin" : item.name;

    // inform guild leader a tribute was paid
    this.socketMessaging.sendMessageToCharacter(
      guildLeader,
      `Tribute(s) paid by ${character.name}: ${lootAmount}x ${itemName} (Territory: ${character.scene})`
    );

    setTimeout(() => {
      this.socketMessaging.sendMessageToCharacter(
        character,
        `Tribute(s) paid to ${guild.name}: ${lootAmount}x ${itemName}`
      );
    }, 3000);
  }

  private async tryToFetchGuildLeaderInventoryOrDepot(guild: IGuild, item: IItem): Promise<IItemContainer | null> {
    const inventoryContainer = await this.guildLeader.getGuildLeaderInventoryItemContainer(guild._id);

    const hasSlotsOnInventory = await this.characterItemSlots.hasAvailableSlot(inventoryContainer?._id, item);

    if (hasSlotsOnInventory) {
      return inventoryContainer;
    }

    const depotContainer = await this.guildLeader.getGuildLeaderDepotItemContainer(guild._id);

    const hasSlotsOnDepot = await this.characterItemSlots.hasAvailableSlot(depotContainer?._id, item);

    if (hasSlotsOnDepot) {
      return depotContainer;
    }

    return null;
  }
}
