import { Character } from "@entities/ModuleCharacter/CharacterModel";
import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { CharacterClass } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

type TopCharacterEntry = {
  name: string;
  level: number;
};

type CharacterRankingClass = {
  class: CharacterClass;
  topPlayers: Array<{ name: string; level: number }>;
};

type TopSkillEntry = {
  name: string;
  skill: string;
  level: number;
};

type CharacterRankingSkill = {
  skill: string;
  top10: TopSkillEntry[];
};

@provide(RankingGetInfo)
export class RankingGetInfo {
  constructor() {}

  public async topLevelGlobal(): Promise<Set<TopCharacterEntry>> {
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

    const result = new Set<TopCharacterEntry>();

    for (const characterSkill of topSkill) {
      const character = await Character.findById(characterSkill.owner).lean().select("name");

      result.add({
        name: character!.name,
        level: characterSkill.level,
      });
    }

    return result;
  }

  public async topLevelClass(): Promise<Record<string, CharacterRankingClass>> {
    const top10ForClass: CharacterRankingClass[] = await Character.aggregate([
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

    const result: Record<string, CharacterRankingClass> = {};

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

  public async topLevelBySkillType(): Promise<CharacterRankingSkill[]> {
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

    const top10ForAllSkills: CharacterRankingSkill[] = [];

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
}
