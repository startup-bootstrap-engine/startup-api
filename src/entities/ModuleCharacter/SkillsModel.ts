import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { createLeanSchema } from "@providers/database/mongooseHelpers";
import { calculateExperience } from "@providers/npc/NPCExperience/NPCExperienceCalculator";
import {
  NPCAlignment,
  SkillType,
  TypeHelper,
  calculateSPToNextLevel,
  calculateXPToNextLevel,
} from "@rpg-engine/shared";
import { ExtractDoc, Type, typedModel } from "ts-mongoose";

import { SpeedGooseCacheAutoCleaner } from "speedgoose";

const skillDetails = (type: SkillType): Record<string, any> => {
  return {
    type: Type.string({
      required: true,
      default: type,
      enum: TypeHelper.enumToStringArray(SkillType),
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
};

export const skillsSchema = createLeanSchema(
  {
    owner: Type.objectId({
      refPath: "ownerRef", // ownerRef can be a Character or NPC!
    }),
    ownerRef: Type.string({
      enum: ["Character", "NPC"],
    }),
    ownerType: Type.string({
      required: true,
      enum: ["Character", "NPC"],
    }),
    level: Type.number({
      required: true,
      default: 1,
    }),
    xpGainRate: Type.number({
      required: true,
      default: 100,
    }),
    experience: Type.number({
      required: true,
      default: 0,
    }),
    xpToNextLevel: Type.number({
      required: true,
      default: calculateXPToNextLevel(0, 2),
    }),

    // Basic attributes

    stamina: skillDetails(SkillType.BasicAttributes),
    magic: skillDetails(SkillType.BasicAttributes),
    magicResistance: skillDetails(SkillType.BasicAttributes),
    strength: skillDetails(SkillType.BasicAttributes),
    resistance: skillDetails(SkillType.BasicAttributes),
    dexterity: skillDetails(SkillType.BasicAttributes),

    // Combat skills

    first: skillDetails(SkillType.Combat),
    club: skillDetails(SkillType.Combat),
    sword: skillDetails(SkillType.Combat),
    axe: skillDetails(SkillType.Combat),
    distance: skillDetails(SkillType.Combat),
    shielding: skillDetails(SkillType.Combat),
    dagger: skillDetails(SkillType.Combat),

    // Crafting/Gathering Skills

    fishing: skillDetails(SkillType.Gathering),
    mining: skillDetails(SkillType.Crafting),
    lumberjacking: skillDetails(SkillType.Crafting),
    cooking: skillDetails(SkillType.Crafting),
    alchemy: skillDetails(SkillType.Crafting),
    blacksmithing: skillDetails(SkillType.Crafting),
    farming: skillDetails(SkillType.Gathering),
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

skillsSchema.index(
  {
    owner: 1,
    ownerType: 1,
  },
  { background: true }
);

skillsSchema.post("save", async function (this: ISkill) {
  const npc = (await NPC.findById(this.owner)) as INPC;

  if (!npc || npc?.experience) {
    return;
  }

  if (npc?.alignment === NPCAlignment.Hostile || npc?.alignment === NPCAlignment.Neutral) {
    const skills = (await Skill.findById(this._id)
      .lean({ virtuals: true, defaults: true })
      .cacheQuery({
        cacheKey: `${this._id}-skills`,
      })) as ISkill;
    const experience = calculateExperience(npc.baseHealth, skills);

    await NPC.updateOne(
      {
        _id: npc._id,
      },
      {
        experience,
      }
    );
  }
});

skillsSchema.plugin(SpeedGooseCacheAutoCleaner);

export type ISkill = ExtractDoc<typeof skillsSchema>;

export const Skill = typedModel("Skill", skillsSchema);
