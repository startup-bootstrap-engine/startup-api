import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IDepot } from "@entities/ModuleDepot/DepotModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { Guild } from "@entities/ModuleSystem/GuildModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { DepotFinder } from "@providers/depot/DepotFinder";
import { provide } from "inversify-binding-decorators";
import { Types } from "mongoose";

@provide(GuildLeader)
export class GuildLeader {
  constructor(private characterInventory: CharacterInventory, private depotFinder: DepotFinder) {}

  public async getGuildLeaderById(guildId: string | Types.ObjectId): Promise<ICharacter> {
    const guild = await Guild.findById(guildId?.toString()).lean();
    if (!guild) {
      throw new Error(`Guild not found for guildId: ${guildId}`);
    }
    if (!guild.guildLeader) {
      throw new Error(`Guild leader not found for guildId: ${guildId}`);
    }
    const guildLeader = await Character.findById(guild.guildLeader).lean<ICharacter>();
    if (!guildLeader) {
      throw new Error(`Guild leader not found for guildId: ${guildId}`);
    }
    return guildLeader;
  }

  public async getGuildLeaderInventory(guildId: Types.ObjectId): Promise<IItem | null> {
    const guildLeader = await this.getGuildLeaderById(guildId);
    const guildLeaderInventory = await this.characterInventory.getInventory(guildLeader);
    if (!guildLeaderInventory) {
      throw new Error(`Guild leader inventory not found for guildId: ${guildId}`);
    }
    return guildLeaderInventory;
  }

  public async getGuildLeaderInventoryItemContainer(guildId: Types.ObjectId): Promise<IItemContainer | null> {
    const guildLeader = await this.getGuildLeaderById(guildId);
    const guildLeaderInventoryContainer = await this.characterInventory.getInventoryItemContainer(guildLeader);
    if (!guildLeaderInventoryContainer) {
      throw new Error(`Guild leader inventory not found for guildId: ${guildId}`);
    }
    return guildLeaderInventoryContainer;
  }

  public async getGuildLeaderDepot(guildId: Types.ObjectId): Promise<IDepot | null> {
    const guildLeader = await this.getGuildLeaderById(guildId);

    if (!guildLeader) {
      throw new Error(`Guild leader not found for guildId: ${guildId}`);
    }

    const depot = await this.depotFinder.findDepotWithSlots(guildLeader);
    if (!depot) {
      throw new Error(`Depot not found for guild leader: ${guildLeader._id}`);
    }
    return depot;
  }

  public async getGuildLeaderDepotItemContainer(guildId: Types.ObjectId): Promise<IItemContainer | null> {
    const depot = await this.getGuildLeaderDepot(guildId);

    if (!depot) {
      throw new Error(`Depot not found for guild leader: ${guildId}`);
    }

    const depotItemContainer = await ItemContainer.findById(depot.itemContainer).lean<IItemContainer>();
    if (!depotItemContainer) {
      throw new Error(`Depot item container not found for depotId: ${depot._id}`);
    }
    return depotItemContainer;
  }
}
