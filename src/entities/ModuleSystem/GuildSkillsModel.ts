import { calculateSPToNextLevel, calculateXPToNextLevel } from "@rpg-engine/shared";
import { ExtractDoc, Type, createSchema, typedModel } from "ts-mongoose";

export enum ElementalType {
  Fire = "fire",
  Water = "water",
  Earth = "earth",
  Air = "air",
  Corruption = "corruption",
  Nature = "nature",
}

function skillDetails(type: ElementalType): Record<string, any> {
  return {
    type: Type.string({
      required: true,
      default: type,
      enum: Object.values(ElementalType),
    }),
    level: Type.number({
      required: true,
      default: 1,
    }),
    skillPoints: Type.number({
      required: true,
      default: 0,
    }),
    skillPointsToNextLevel: Type.number({
      required: true,
      default: calculateSPToNextLevel(0, 2),
    }),
    lastSkillGain: Type.date({
      required: true,
      default: new Date(),
    }),
  };
}

const GuildSkillsSchema = createSchema(
  {
    owner: Type.objectId({
      ref: "Guild", // Reference to the Guild model
      required: true,
    }),
    level: Type.number({
      required: true,
      default: 1,
    }),
    guildPoints: Type.number({
      required: true,
      default: 0,
    }),
    guildPointsToNextLevel: Type.number({
      required: true,
      default: calculateSPToNextLevel(0, 2),
    }),
    experience: Type.number({
      required: true,
      default: 0,
    }),
    xpToNextLevel: Type.number({
      required: true,
      default: calculateXPToNextLevel(0, 2),
    }),
    // Elemental skills
    fireSkill: skillDetails(ElementalType.Fire),
    waterSkill: skillDetails(ElementalType.Water),
    earthSkill: skillDetails(ElementalType.Earth),
    airSkill: skillDetails(ElementalType.Air),
    corruptionSkill: skillDetails(ElementalType.Corruption),
    natureSkill: skillDetails(ElementalType.Nature),
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export type IGuildSkills = ExtractDoc<typeof GuildSkillsSchema>;

export const GuildSkills = typedModel("GuildSkills", GuildSkillsSchema);