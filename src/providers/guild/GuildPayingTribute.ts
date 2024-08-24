import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { IGuild } from "@entities/ModuleSystem/GuildModel";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { blueprintManager } from "@providers/inversify/container";
import { OthersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { provide } from "inversify-binding-decorators";
import _ from "lodash";
import { GuildCommon } from "./GuildCommon";
import { GuildTerritory } from "./GuildTerritory";

const LOOT_CHANCE_THRESHOLD = 70;
const MIN_LOOT_AMOUNT = 1;

@provide(GuildPayingTribute)
export class GuildPayingTribute {
  constructor(
    private guildTerritory: GuildTerritory,
    private socketMessaging: SocketMessaging,
    private guildCommon: GuildCommon,
    private characterItemContainer: CharacterItemContainer
  ) {}

  public async payTribute(character: ICharacter, item: IItem): Promise<number> {
    try {
      const mapName = character.scene;
      const guild = await this.guildTerritory.getTerritoryOwnedByMap(mapName);
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
    if (item.key === OthersBlueprint.GoldCoin) {
      return Math.max(
        MIN_LOOT_AMOUNT,
        _.random(MIN_LOOT_AMOUNT, Math.min(maxLootShare, item.stackQty || MIN_LOOT_AMOUNT))
      );
    } else {
      const random = _.random(0, 100);
      return random > LOOT_CHANCE_THRESHOLD
        ? 0
        : Math.max(
            MIN_LOOT_AMOUNT,
            _.random(MIN_LOOT_AMOUNT, Math.min(maxLootShare, item.stackQty || MIN_LOOT_AMOUNT))
          );
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

    const container = await ItemContainer.findOne({ owner: guild._id }).lean();
    const blueprint = await blueprintManager.getBlueprint<IItem>("items", item.key);
    const newItem = (await Item.create({
      ...blueprint,
      stackQty: lootAmount,
    })) as IItem;

    if (container) {
      await this.characterItemContainer.addItemToContainer(newItem, character, container._id);
    }

    const itemName = item.key === OthersBlueprint.GoldCoin ? "gold" : item.name;

    setTimeout(() => {
      this.socketMessaging.sendMessageToCharacter(
        character,
        `Tribute(s) paid to ${guild.name}: ${lootAmount}x ${itemName}`
      );
    }, 3000);
  }
}
