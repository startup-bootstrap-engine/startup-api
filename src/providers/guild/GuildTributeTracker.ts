import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterGold } from "@providers/character/CharacterGold";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";

import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { Guild } from "@entities/ModuleSystem/GuildModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { ISkill } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(GuildTributeTracker)
export class GuildTributeTracker {
  private readonly namespace = "guild-tribute";

  constructor(
    private inMemoryHashTable: InMemoryHashTable,
    private socketMessaging: SocketMessaging,
    private characterGold: CharacterGold
  ) {}

  public async addTributeToBePaidToGuild(guildId: string, tributeAmount: number): Promise<void> {
    const currentTribute = ((await this.inMemoryHashTable.get(this.namespace, guildId)) as unknown as number) || 0;
    const newTributeAmount = currentTribute + tributeAmount;

    await this.inMemoryHashTable.set(this.namespace, guildId, newTributeAmount);
  }

  public async distributeTributeToAllGuilds(): Promise<void> {
    const guilds = await Guild.find().lean();

    for (const guild of guilds) {
      await this.distributeTributeToGuildMembers(guild._id.toString());
    }
  }

  private async distributeTributeToGuildMembers(guildId: string): Promise<void> {
    const guild = await Guild.findById(guildId).lean();

    if (!guild) {
      throw new Error(`Guild with ID ${guildId} not found.`);
    }

    let totalTribute = (await this.inMemoryHashTable.get(this.namespace, guildId)) as unknown as number;

    console.log(`Distributing tribute to guild ${guild.name} (${guildId}): ${totalTribute}`);

    if (!totalTribute || totalTribute <= 0) {
      await this.resetTribute(guildId); // Ensure reset even if there's no tribute
      return;
    }

    const members = await Character.find({ _id: { $in: guild.members } }).lean<ICharacter[]>();

    if (!members.length) {
      await this.resetTribute(guildId); // Ensure reset even if there are no members
      return;
    }

    let totalLevel = 0;
    const memberSkillsMap: Map<string, ISkill> = new Map();

    // Fetch skills for each member and calculate the total level
    for (const member of members) {
      const skills = await Skill.findById(member.skills)
        .lean<ISkill>({ virtuals: true, defaults: true })
        .cacheQuery({
          cacheKey: `${member._id}-skills`,
        });
      if (skills) {
        memberSkillsMap.set(member._id.toString(), skills);
        totalLevel += skills.level;
      }
    }

    if (totalLevel === 0) {
      await this.resetTribute(guildId); // No valid levels, avoid division by zero
      return;
    }

    const leaderBonusMultiplier = 1.25;
    const leaderBonus = guild.guildLeader ? leaderBonusMultiplier : 1;

    for (const member of members) {
      const skills = memberSkillsMap.get(member._id.toString());
      if (!skills) {
        continue; // Skip if skills data is not found
      }

      const levelMultiplier = skills.level / totalLevel;
      let memberShare = totalTribute * levelMultiplier;

      // Apply leader bonus if applicable
      if (member._id.toString() === guild.guildLeader?.toString()) {
        memberShare *= leaderBonus;
      }

      memberShare = Math.min(memberShare, totalTribute); // Ensure member doesn't get more than total tribute

      if (memberShare <= 0) {
        continue;
      }

      try {
        console.log(`Distributing ${memberShare} gold to ${member.name}`);
        this.socketMessaging.sendMessageToCharacter(
          member,
          `💰 You received ${Math.round(memberShare)} gold coin(s) as your share of the guild tribute.`
        );

        await this.characterGold.addGoldToCharacterInventory(member, memberShare);
        totalTribute -= memberShare;
      } catch (error) {
        console.error(`Failed to distribute gold to member ${member._id}:`, error);
        continue; // Avoid getting stuck if something fails
      }
    }

    // Reset the tribute amount to 0 after distribution
    await this.resetTribute(guildId);
  }

  private async resetTribute(guildId: string): Promise<void> {
    await this.inMemoryHashTable.set(this.namespace, guildId, 0);
  }
}
