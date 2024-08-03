import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild } from "@entities/ModuleSystem/GuildModel";
import { provide } from "inversify-binding-decorators";

const EXP_TO_CONTROL_POINT_RATIO = 10;

@provide(GuildTerritoryControlPoint)
export class GuildTerritoryControlPoint {
  constructor() {}

  public async updateGuildTerritoryControlPoint(map: string, character: ICharacter, exp: number): Promise<void> {
    try {
      const xp = exp / EXP_TO_CONTROL_POINT_RATIO;

      const guild = await Guild.findOne({ $or: [{ guildLeader: character._id }, { members: character._id }] }).lean();

      if (!guild) return;

      const controlPoints = guild.controlPoints || [];
      const existingIndex = controlPoints.findIndex((cp) => cp.map === map);

      if (existingIndex !== -1) {
        controlPoints[existingIndex].point += xp;
      } else {
        controlPoints.push({ map, point: xp });
      }

      await Guild.updateOne({ _id: guild._id }, { $set: { controlPoints } });
    } catch (error) {
      console.error("Error updating guild territory control point:", error);
    }
  }
}
