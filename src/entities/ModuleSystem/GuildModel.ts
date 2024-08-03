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
  controlPoints: [
    {
      map: Type.string({ required: true }),
      point: Type.number({ required: true, default: 0 }),
    },
  ],
  guildSkills: Type.objectId({
    ref: "GuildSkills",
  }),
});

guildSchema.index({ guildLeader: 1, members: 1 });
guildSchema.index({ name: 1 });
guildSchema.index({ tag: 1 });
guildSchema.index({ "territoriesOwned.map": 1 });
guildSchema.index({ "controlPoints.map": 1 });
guildSchema.index({ guildSkills: 1 });

export type IGuild = ExtractDoc<typeof guildSchema>;

export const Guild = typedModel("Guild", guildSchema);
