import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { DiscordBot } from "@providers/discord/DiscordBot";
import { MapName } from "@providers/map/MapName";
import { provide } from "inversify-binding-decorators";
import { UpdateWriteOpResult } from "mongoose";
import { GuildCommon } from "./GuildCommon";

interface IGuildMapPoints {
  guildId: string;
  points: number;
}

@provide(GuildTerritory)
export class GuildTerritory {
  constructor(private mapName: MapName, private guildCommon: GuildCommon, private discordBot: DiscordBot) {}

  public async trySetMapControl(map: string): Promise<void> {
    try {
      const mapControlGuild = await this.getMapControl(map);
      if (!mapControlGuild) {
        return;
      }

      const oldMapControl = await this.getGuildByTerritoryMap(map);

      if (this.isMapAlreadyControlled(mapControlGuild, map)) {
        return;
      }

      await this.notifyMembersOfControlChange(map, mapControlGuild, oldMapControl);
      await this.updateMapControl(map, mapControlGuild);
    } catch (error) {
      console.error("Error setting map control:", error);
      throw new Error("Failed to set map control");
    }
  }

  private isMapAlreadyControlled(guild: IGuild, map: string): boolean {
    const territoriesOwned = guild.territoriesOwned || [];
    return territoriesOwned.some((territory) => territory.map === map);
  }

  private async notifyMembersOfControlChange(
    map: string,
    newControl: IGuild,
    oldControl: IGuild | null
  ): Promise<void> {
    const formattedMapName = this.getFormattedTerritoryName(map);
    let message: string;

    if (!oldControl) {
      message = `${newControl.name} has taken control of ${formattedMapName}.`;
    } else {
      message = `😈 ${newControl.name} has stolen the control of ${formattedMapName} from ${oldControl.name}.`;
    }

    // Send message to all guild members
    await this.guildCommon.sendMessageToAllMembers(message, newControl);

    // Send message to Discord
    await this.discordBot.sendMessage(message, "guilds");
  }

  private async updateMapControl(map: string, guild: IGuild): Promise<void> {
    await this.removeTerritoriesForMap(map);
    await Guild.updateOne(
      { _id: guild._id },
      { $push: { territoriesOwned: { map, lootShare: 15, controlPoint: true } } }
    );
  }

  public async getMapControl(map: string): Promise<IGuild | null> {
    try {
      const guilds = await Guild.find().lean();

      if (!guilds || guilds.length === 0) {
        return null;
      }

      const guildSortbyMapPoints = this.sortGuildsByMapPoints(guilds as IGuild[], map);
      if (guildSortbyMapPoints.length > 0 && guildSortbyMapPoints[0].points > 0) {
        return Guild.findOne({ _id: guildSortbyMapPoints[0].guildId }).lean();
      }
      return null;
    } catch (error) {
      console.error(`Error fetching map control for ${map}:`, error);
      return null;
    }
  }

  public async getGuildByTerritoryMap(map: string): Promise<IGuild | null> {
    const guild = await Guild.findOne({
      "territoriesOwned.map": map,
      "territoriesOwned.controlPoint": true,
    }).lean();
    if (guild) return guild as IGuild;
    else return null;
  }

  public getFormattedTerritoryName(map: string): string {
    return this.mapName.getFormattedMapName(map);
  }

  public getTerritoryLootShare(guild: IGuild, map: string): number {
    const ownedTerritory = guild?.territoriesOwned?.find((t) => t.map === map);

    return ownedTerritory?.lootShare || 0;
  }

  private async removeTerritoriesForMap(mapName: string): Promise<void> {
    try {
      const result: UpdateWriteOpResult = await Guild.updateMany(
        { "territoriesOwned.map": mapName },
        {
          $pull: {
            territoriesOwned: { map: mapName },
          },
        }
      );

      console.log(`Updated ${result.n} guild(s), Modified ${result.nModified} guild(s)`);
    } catch (error) {
      console.error("Error removing territories:", error);
    }
  }

  private sortGuildsByMapPoints(guilds: IGuild[], mapName: string): IGuildMapPoints[] {
    if (!guilds) {
      return [];
    }

    const guildPoints: IGuildMapPoints[] = guilds?.map((guild) => {
      const mapControl = guild.controlPoints?.find((cp) => cp.map === mapName);
      return {
        guildId: guild._id,
        points: mapControl ? mapControl.point : 0,
      };
    });

    return guildPoints.sort((a, b) => b.points - a.points);
  }
}
