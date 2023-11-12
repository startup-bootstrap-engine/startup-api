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

  public async topLevelGlobal(): Promise<IRankingTopCharacterEntry[]> {
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

    const result: IRankingTopCharacterEntry[] = [];

    const characterIds = topSkill.map((characterSkill) => characterSkill.owner);
    const characterPromises = characterIds.map((characterId) =>
      Character.findById(characterId).lean().select("name").exec()
    );

    const characters = await Promise.all(characterPromises);

    characters.forEach((character, index) => {
      result.push({
        name: character?.name || "Unknown",
        level: topSkill[index].level,
      });
    });

    return result;
  }

  public async topLevelClass(): Promise<Record<string, IRankingCharacterClass>> {
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

    const characterInfo = await Skill.aggregate([
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
    ]).exec();

    const top10Promises = skills.map((skill) => {
      const top10ForSkill = characterInfo
        .map((char) => ({
          name: char.characterInfo.name,
          skill: skill,
          level: char[skill].level,
        }))
        .filter((char) => char.level)
        .sort((a, b) => b.level - a.level)
        .slice(0, 10);

      return { skill: skill, top10: top10ForSkill };
    });

    return Promise.all(top10Promises);
  }

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
