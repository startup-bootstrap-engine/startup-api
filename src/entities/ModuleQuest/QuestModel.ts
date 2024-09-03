import { createLeanSchema } from "@providers/database/mongooseHelpers";
import { ExtractDoc, Type, typedModel } from "ts-mongoose";

const questSchema = createLeanSchema(
  {
    npcId: Type.objectId({ ref: "NPC" }),
    title: Type.string({ required: true }),
    key: Type.string({ required: true }),
    description: Type.string({ required: true }),
    rewards: Type.array().of(Type.objectId({ ref: "QuestReward" })),
    objectives: Type.array().of(Type.objectId()),
    canBeRepeated: Type.boolean({ required: true, default: false }),
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

questSchema.index(
  {
    npcId: 1,
    key: 1,
  },
  { background: true }
);

export type IQuest = ExtractDoc<typeof questSchema>;

export const Quest = typedModel("Quest", questSchema);
