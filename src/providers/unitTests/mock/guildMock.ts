import { IGuild } from "@entities/ModuleSystem/GuildModel";
import { Types } from "mongoose";

export const guildMock: Partial<IGuild> = {
  name: "Example Guild",
  tag: "ExpGuild",
  coatOfArms: "example.png",
  guildLeader: "6233ff328f3b09002fe32f9b" as unknown as Types.ObjectId,
  members: ["6233ff328f3b09002fe32f9c"],
  territoriesOwned: [
    {
      map: "example",
      lootShare: 10,
      controlPoint: true,
    },
  ],
  controlPoints: [{ map: "example", point: 20 }],
  guildSkills: undefined,
};
