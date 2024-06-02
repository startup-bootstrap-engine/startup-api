import { ExtractDoc, Type, createSchema, typedModel } from "ts-mongoose";

const guildSchema = createSchema({
  name: Type.string({ required: true, unique: true }),
  tag: Type.string({ required: true, unique: true }),
  coatOfArms: Type.string({ required: true }),
  guildLeader: Type.objectId({
    ref: "Character",
  }),
  members: [Type.string({ required: true })], // Array of user IDs
  territoriesOwned: [
    {
      map: Type.string({ required: true }),
      lootShare: Type.number({ required: true, min: 10, max: 25 }),
      controlPoint: Type.boolean({ required: true, default: false }),
    },
  ],
  guildSkills: Type.objectId({
    ref: "GuildSkills",
  }),
});

export type IGuild = ExtractDoc<typeof guildSchema>;

export const Guild = typedModel("Guild", guildSchema);
