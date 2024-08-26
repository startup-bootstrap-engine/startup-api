import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { IGuild } from "@entities/ModuleSystem/GuildModel";
import { OthersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { provide } from "inversify-binding-decorators";
import { GuildCommon } from "./GuildCommon";
import { GuildTerritory } from "./GuildTerritory";
import { GuildTributeTracker } from "./GuildTributeTracker";

@provide(GuildPayingTribute)
export class GuildPayingTribute {
  constructor(
    private guildTerritory: GuildTerritory,
    private guildCommon: GuildCommon,
    private guildTributeTracker: GuildTributeTracker
  ) {}

  public async payTribute(character: ICharacter, item: IItem): Promise<number> {
    try {
      // Only process if the item is Gold Coin
      if (item.key !== OthersBlueprint.GoldCoin) {
        return item.stackQty!;
      }

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
      const tributeAmount = this.calculateGoldTribute(item.stackQty, lootShare);

      if (tributeAmount > 0 && tributeAmount <= item.stackQty) {
        await this.processGoldTribute(item, guild, tributeAmount);
        return item.stackQty! - tributeAmount;
      }

      return item.stackQty!;
    } catch (error) {
      console.error("Error paying tribute:", error);
      return item.stackQty!;
    }
  }

  private calculateGoldTribute(stackQty: number, lootShare: number): number {
    return Math.round((stackQty / 100) * lootShare);
  }

  private async processGoldTribute(item: IItem, guild: IGuild, tributeAmount: number): Promise<void> {
    const updatedStackQty = item.stackQty! - tributeAmount;
    await Item.updateOne({ _id: item._id }, { stackQty: updatedStackQty });

    if (!guild?._id) {
      throw new Error("Guild not found");
    }

    // Add the tribute amount to the guild using the GuildTributeTracker
    await this.guildTributeTracker.addTributeToBePaidToGuild(guild._id.toString(), tributeAmount);
  }
}
