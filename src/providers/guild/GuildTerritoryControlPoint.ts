import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import {
  GUILD_CONTROL_MINIMUM_THRESHOLD,
  GUILD_CONTROL_POINT_DECREASE_PERCENTAGE,
  GUILD_TERRITORY_INACTIVITY_THRESHOLD_DAYS,
} from "@providers/constants/GuildConstants";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";
import { GuildTerritory } from "./GuildTerritory";

const EXP_TO_CONTROL_POINT_RATIO = 10;

@provide(GuildTerritoryControlPoint)
export class GuildTerritoryControlPoint {
  constructor(private guildTerritory: GuildTerritory) {}

  public async updateGuildTerritoryControlPoint(map: string, character: ICharacter, exp: number): Promise<void> {
    try {
      const xp = exp / EXP_TO_CONTROL_POINT_RATIO;

      const guild = await Guild.findOne({ $or: [{ guildLeader: character._id }, { members: character._id }] }).lean();

      if (!guild) return;

      const controlPoints = guild.controlPoints || [];
      const existingIndex = controlPoints.findIndex((cp) => cp.map === map);

      if (existingIndex !== -1) {
        controlPoints[existingIndex].point += xp;
        controlPoints[existingIndex].lastUpdated = new Date();
      } else {
        controlPoints.push({ map, point: xp, lastUpdated: new Date() });
      }

      await Guild.updateOne({ _id: guild._id }, { $set: { controlPoints } });
    } catch (error) {
      console.error("Error updating guild territory control point:", error);
    }
  }

  public async reduceControlPointForNonActiveGuild(): Promise<void> {
    try {
      const guilds = await Guild.find().lean();

      const timeInMinutes = GUILD_TERRITORY_INACTIVITY_THRESHOLD_DAYS * 60 * 24;
      const inactivityThreshold = dayjs().subtract(timeInMinutes, "minute");
      const updatedGuildsPromises = guilds.map((guild) => this.processGuild(guild as IGuild, inactivityThreshold));
      const updatedGuilds = await Promise.all(updatedGuildsPromises);
      const mapsToUpdate = this.collectMapsToUpdate(updatedGuilds);

      await this.updateGuildsInDatabase(updatedGuilds);
      await this.updateMapControls(mapsToUpdate);
    } catch (error) {
      console.error("Error reducing control point form non active guild:", error);
    }
  }

  private async processGuild(guild: IGuild, inactivityThreshold: dayjs.Dayjs): Promise<IGuild> {
    const updatedControlPoints = this.updateControlPoints(guild, inactivityThreshold);
    const updatedTerritoriesOwned = this.updateTerritoriesOwned(guild, updatedControlPoints);

    const updatedGuild = await Guild.findByIdAndUpdate(
      guild._id,
      {
        $set: {
          controlPoints: updatedControlPoints,
          territoriesOwned: updatedTerritoriesOwned,
        },
      },
      { new: true, lean: true }
    ).exec();

    return updatedGuild || guild; // Return the original guild if update fails
  }

  private updateControlPoints(
    guild: IGuild,
    inactivityThreshold: dayjs.Dayjs
  ): Array<{ map: string; point: number; lastUpdated: Date }> {
    return guild.controlPoints.map((controlPoint) => {
      const ownedTerritory = guild.territoriesOwned.find((territory) => territory.map === controlPoint.map);
      const lastUpdated = dayjs(controlPoint.lastUpdated);

      if (ownedTerritory && lastUpdated.isBefore(inactivityThreshold)) {
        const newPoint = Math.max(0, controlPoint.point * (1 - GUILD_CONTROL_POINT_DECREASE_PERCENTAGE / 100));
        return {
          ...controlPoint,
          point: newPoint < GUILD_CONTROL_MINIMUM_THRESHOLD ? 0 : newPoint,
        };
      }
      return controlPoint;
    });
  }

  private updateTerritoriesOwned(
    guild: IGuild,
    updatedControlPoints: Array<{ map: string; point: number; lastUpdated: Date }>
  ): Array<{ map: string; lootShare: number; controlPoint: boolean }> {
    return guild.territoriesOwned
      .filter((territory) => {
        // eslint-disable-next-line mongoose-lean/require-lean
        const controlPoint = updatedControlPoints.find((cp) => cp.map === territory.map);
        return controlPoint && controlPoint.point > GUILD_CONTROL_MINIMUM_THRESHOLD;
      })
      .map((territory) => ({
        ...territory,
        lootShare: territory.lootShare || 0,
        controlPoint: true,
      }));
  }

  private collectMapsToUpdate(guilds: IGuild[]): Set<string> {
    return new Set(guilds.flatMap((guild) => guild.territoriesOwned.map((territory) => territory.map)));
  }

  private async updateGuildsInDatabase(guilds: IGuild[]): Promise<void> {
    const bulkOps = guilds.map((guild) => ({
      updateOne: {
        filter: { _id: guild._id },
        update: {
          $set: {
            controlPoints: guild.controlPoints,
            territoriesOwned: guild.territoriesOwned,
          },
        },
      },
    }));

    try {
      await Guild.bulkWrite(bulkOps);
    } catch (error) {
      console.error("Error updating guilds in database", error);
    }
  }

  private async updateMapControls(mapsToUpdate: Set<string>): Promise<void> {
    for (const map of mapsToUpdate) {
      try {
        await this.guildTerritory.trySetMapControl(map);
      } catch (error) {
        console.error(`Error updating map control for map: ${map}`, error);
      }
    }
  }
}
