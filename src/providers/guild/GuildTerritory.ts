import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IUIShowMessage, UISocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { UpdateWriteOpResult } from "mongoose";
import { GuildCommon } from "./GuildCommon";

interface IGuildMapPoints {
  guildId: string;
  points: number;
}

@provide(GuildTerritory)
export class GuildTerritory {
  constructor(private guildCommon: GuildCommon, private socketMessaging: SocketMessaging) {}

  public async trySetMapControl(map: string): Promise<void> {
    try {
      const mapControlGuild = await this.getMapControl(map);
      if (!mapControlGuild) {
        return;
      }

      const territoriesOwned = mapControlGuild.territoriesOwned;
      const existingIndex = territoriesOwned.findIndex((to) => to.map === map);

      // If this guild already owns this map, do nothing
      if (existingIndex !== -1) {
        return;
      }

      this.socketMessaging.sendEventToAllUsers<IUIShowMessage>(UISocketEvents.ShowMessage, {
        message: `${map} is now controlled by ${mapControlGuild.name}.`,
        type: "info",
      });

      await this.removeTerritoriesForMap(map);
      await Guild.updateOne(
        { _id: mapControlGuild._id },
        { $push: { territoriesOwned: { map, lootShare: 15, controlPoint: true } } }
      );
    } catch (error) {
      console.error("Error setting map control:", error);
    }
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
