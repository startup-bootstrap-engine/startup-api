import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
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
import { RankingCache } from "./RankingCache";

@provide(RankingGetInfo)
export class RankingGetInfo {
  constructor(private socketMessaging: SocketMessaging, private rankingCache: RankingCache) {}

  @TrackNewRelicTransaction()
  public async topLevelGlobal(): Promise<IRankingTopCharacterEntry[]> {
    const cachedTopLevelGlobal = await this.rankingCache.getTopLevelBy<IRankingTopCharacterEntry[]>("global");
    if (cachedTopLevelGlobal) {
      return cachedTopLevelGlobal;
    }

    const topSkill = await Skill.aggregate([
      {
        $match: {
          ownerType: "Character",
        },
      },
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
        },
      },
      { $sort: { level: -1 } },
      { $limit: 10 },
      {
        $project: {
          name: "$characterInfo.name",
          level: 1,
        },
      },
    ]).exec();

    // Convert the aggregation result directly into the final structure
    const result = topSkill.map((skill) => ({
      name: skill.name || "Unknown",
      level: skill.level,
    }));

    await this.rankingCache.setTopLevelBy("global", result);

    return result;
  }

  @TrackNewRelicTransaction()
  public async topLevelClass(): Promise<Record<string, IRankingCharacterClass>> {
    const cachedTopLevelByClass = await this.rankingCache.getTopLevelBy<Record<string, IRankingCharacterClass>>(
      "class"
    );

    if (cachedTopLevelByClass) {
      return cachedTopLevelByClass;
    }

    const characterClasses = Object.values(CharacterClass);

    const characterInfo = await Character.aggregate([
      {
        $match: {
          class: { $in: characterClasses },
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
    ]).exec();

    const result: Record<string, IRankingCharacterClass> = {};

    characterClasses.forEach((characterClass) => {
      const topPlayersForClass = characterInfo
        .filter((char) => char.class === characterClass)
        .map((char) => ({ name: char.name, level: char.skillInfo.level }))
        .sort((a, b) => b.level - a.level)
        .slice(0, 10);

      result[characterClass] = { class: characterClass, topPlayers: topPlayersForClass };
    });

    await this.rankingCache.setTopLevelBy("class", result);

    return result;
  }

  @TrackNewRelicTransaction()
  public async topLevelBySkillType(): Promise<IRankingCharacterSkill[]> {
    const cachedTopLevelBySkill = await this.rankingCache.getTopLevelBy<IRankingCharacterSkill[]>("skill");
    if (cachedTopLevelBySkill) {
      return cachedTopLevelBySkill;
    }

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

    const pipeline = skills.map((skill) => {
      return [
        {
          $match: {
            [skill]: { $exists: true, $ne: null },
          },
        },
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
            "characterInfo.name": { $not: /GM/ },
          },
        },
        {
          $project: {
            name: "$characterInfo.name",
            skill: skill,
            level: `$${skill}.level`,
          },
        },
        { $sort: { level: -1 } },
        { $limit: 10 },
      ];
    });

    const top10SkillsPromises = pipeline.map((skillPipeline) => Skill.aggregate(skillPipeline).exec());

    const top10SkillsResults = await Promise.all(top10SkillsPromises);

    const results = skills.map((skill, index) => {
      return { skill: skill, top10: top10SkillsResults[index] };
    });

    await this.rankingCache.setTopLevelBy("skill", results);

    return results;
  }

  @TrackNewRelicTransaction()
  public async getLevelRanking(character: ICharacter): Promise<void | ILeaderboardLevelRankingResponse> {
    const levelRank = await this.topLevelGlobal();
    this.socketMessaging.sendEventToUser<ILeaderboardLevelRankingResponse>(
      character.channelId!,
      LeaderboardSocketEvents.GetLevelRanking,
      {
        levelRank,
      }
    );
    return { levelRank };
  }

  @TrackNewRelicTransaction()
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

  @TrackNewRelicTransaction()
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
