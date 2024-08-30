import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
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

      // steal guild control points
      const stealXp = await this.StealGuildControlPoints(map, guild as IGuild);
      const newXp = xp + stealXp;

      const controlPoints = guild.controlPoints || [];
      const existingIndex = controlPoints.findIndex((cp) => cp.map === map);

      if (existingIndex !== -1) {
        controlPoints[existingIndex].point += newXp;
      } else {
        controlPoints.push({ map, point: newXp });
      }

      await Guild.updateOne({ _id: guild._id }, { $set: { controlPoints } });
    } catch (error) {
      console.error("Error updating guild territory control point:", error);
    }
  }

  private async StealGuildControlPoints(map: string, myGuild: IGuild): Promise<number> {
    try {
      const mapControlGuild = await this.guildTerritory.getGuildByTerritoryMap(map);
      if (!mapControlGuild || mapControlGuild._id.toString() === myGuild._id.toString()) {
        return 0;
      }

      // removing control points
      const controlPoints = mapControlGuild.controlPoints || [];
      const existingIndex = controlPoints.findIndex((cp) => cp.map === map);

      if (existingIndex === -1 || controlPoints[existingIndex].point <= 0) {
        return 0;
      }

      controlPoints[existingIndex].point -= 1;
      await Guild.updateOne({ _id: mapControlGuild._id }, { $set: { controlPoints } });

      // stealing control points return
      return 1;
    } catch (error) {
      console.error("Error in stealing guild control points: ", error);

      return 0;
    }
  }
}
