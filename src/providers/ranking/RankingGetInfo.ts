import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  CharacterClass,
  ILeaderboardClassRankingResponse,
  ILeaderboardLevelRankingResponse,
  ILeaderboardSkillRankingResponse,
  IRankingCharacterClass,
  IRankingCharacterSkill,
  IRankingTopCharacterEntry,
  LeaderboardSocketEvents,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(RankingGetInfo)
export class RankingGetInfo {
  constructor(private socketMessaging: SocketMessaging) {}

  public async topLevelGlobal(): Promise<Set<IRankingTopCharacterEntry>> {
    const topSkill = await Skill.aggregate([
      {
        $lookup: {
          from: "characters",
          localField: "owner",
          foreignField: "_id",
          as: "characterInfo",
        },
      },
      { $unwind: "$characterInfo" },
      {
        $match: {
          "characterInfo.name": { $not: /^GM/ },
          ownerType: "Character",
        },
      },
      { $sort: { level: -1 } },
      { $limit: 10 },
      {
        $project: {
          owner: 1,
          level: 1,
        },
      },
    ]).exec();

    const result = new Set<IRankingTopCharacterEntry>();

    for (const characterSkill of topSkill) {
      const character = await Character.findById(characterSkill.owner).lean().select("name");

      result.add({
        name: character!.name,
        level: characterSkill.level,
      });
    }

    return result;
  }

  public async topLevelClass(): Promise<Record<string, IRankingCharacterClass>> {
    const top10ForClass: IRankingCharacterClass[] = await Character.aggregate([
      {
        $match: {
          class: { $in: Object.values(CharacterClass) },
          name: { $not: /^GM/ },
        },
      },
      {
        $lookup: {
          from: "skills",
          localField: "skills",
          foreignField: "_id",
          as: "skillInfo",
        },
      },
      {
        $unwind: "$skillInfo",
      },
      {
        $sort: { "skillInfo.level": -1 },
      },
      {
        $group: {
          _id: "$class",
          topPlayers: {
            $push: {
              name: "$name",
              level: "$skillInfo.level",
            },
          },
        },
      },
      {
        $project: {
          class: "$_id",
          _id: 0,
          topPlayers: { $slice: ["$topPlayers", 10] },
        },
      },
    ]).exec();

    const result: Record<string, IRankingCharacterClass> = {};

    for (const ranking of top10ForClass) {
      if (!result[ranking.class]) {
        result[ranking.class] = { class: ranking.class, topPlayers: [] };
      }

      ranking.topPlayers.forEach((char) => {
        result[ranking.class].topPlayers.push({
          name: char.name,
          level: char.level,
        });
      });

      result[ranking.class].topPlayers.sort((a, b) => b.level - a.level);
    }

    return result;
  }

  public async topLevelBySkillType(): Promise<IRankingCharacterSkill[]> {
    const skills = [
      "stamina",
      "magic",
      "magicResistance",
      "strength",
      "resistance",
      "dexterity",
      "first",
      "club",
      "sword",
      "axe",
      "distance",
      "shielding",
      "dagger",
      "fishing",
      "mining",
      "lumberjacking",
      "cooking",
      "alchemy",
      "blacksmithing",
    ];

    const top10ForAllSkills: IRankingCharacterSkill[] = [];

    for (const skill of skills) {
      const top10ForSkill = await Skill.aggregate([
        {
          $lookup: {
            from: "characters",
            localField: "owner",
            foreignField: "_id",
            as: "characterInfo",
          },
        },
        {
          $unwind: "$characterInfo",
        },
        {
          $match: {
            "characterInfo.name": { $not: /GM/ },
          },
        },
        {
          $sort: { [`${skill}.level`]: -1 },
        },
        {
          $limit: 10,
        },
        {
          $project: {
            _id: 0,
            name: "$characterInfo.name",
            skill: skill,
            level: `$${skill}.level`,
          },
        },
      ]).exec();

      top10ForAllSkills.push({ skill: skill, top10: top10ForSkill });
    }

    return top10ForAllSkills;
  }

  public async getLevelRanking(character: ICharacter): Promise<void | ILeaderboardLevelRankingResponse> {
    const levelRank = await this.topLevelGlobal();
    console.log("sending event to user");
    this.socketMessaging.sendEventToUser<ILeaderboardLevelRankingResponse>(
      character.channelId!,
      LeaderboardSocketEvents.GetLevelRanking,
      {
        levelRank,
      }
    );
    console.log("sent event to user");
    return { levelRank };
  }

  public async getClassRanking(
    character: ICharacter
  ): Promise<void | Record<string, ILeaderboardClassRankingResponse>> {
    const classRank = await this.topLevelClass();
    this.socketMessaging.sendEventToUser<ILeaderboardClassRankingResponse>(
      character.channelId!,
      LeaderboardSocketEvents.GetClassRanking,
      {
        classRank,
      }
    );
    return { classRank };
  }

  public async getSkillRanking(character: ICharacter): Promise<void | ILeaderboardSkillRankingResponse> {
    const skillRank = await this.topLevelBySkillType();
    this.socketMessaging.sendEventToUser<ILeaderboardSkillRankingResponse>(
      character.channelId!,
      LeaderboardSocketEvents.GetSkillRanking,
      {
        skillRank,
      }
    );
    return { skillRank };
  }
}
