import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { GUILD_INACTIVITY_THRESHOLD_DAYS } from "@providers/constants/GuildConstants";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";

@provide(GuildCleaner)
export class GuildCleaner {
  public async removeInactiveMembersFromAllGuilds(): Promise<void> {
    const guilds = await Guild.find().lean<IGuild[]>();

    for (const guild of guilds) {
      await this.removeInactiveMembersFromGuild(guild);
    }
  }

  public async removeInactiveMembersFromGuild(guild: IGuild): Promise<void> {
    const inactiveMembers: string[] = [];

    for (const memberId of guild.members) {
      const member = await Character.findById(memberId).lean<ICharacter>();

      if (member && this.isInactive(member.lastDayPlayed)) {
        inactiveMembers.push(member._id);
      }
    }

    if (inactiveMembers.length > 0) {
      console.log(`Inactive members: ${inactiveMembers}`);

      const updatedGuild = await Guild.findByIdAndUpdate(
        guild._id,
        { $pull: { members: { $in: inactiveMembers } } },
        { new: true }
      );

      console.log(`Removed ${inactiveMembers.length} inactive members from guild ${guild.name}.`);
    } else {
      console.log(`No inactive members found for guild ${guild.name}.`);
    }
  }

  private isInactive(lastDayPlayed: Date | undefined): boolean {
    if (!lastDayPlayed) return true;
    const inactivityThreshold = dayjs().subtract(GUILD_INACTIVITY_THRESHOLD_DAYS, "day");
    return dayjs(lastDayPlayed).isBefore(inactivityThreshold);
  }
}
