import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterGold } from "@providers/character/CharacterGold";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";

import { Guild } from "@entities/ModuleSystem/GuildModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
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

    const totalTribute = (await this.inMemoryHashTable.get(this.namespace, guildId)) as unknown as number;

    console.log(`Distributing tribute to guild ${guild.name} (${guildId}): ${totalTribute}`);

    if (!totalTribute || totalTribute <= 0) {
      await this.resetTribute(guildId); // Ensure reset even if there's no tribute
      return;
    }

    const membersCount = guild.members.length;
    if (membersCount === 0) {
      await this.resetTribute(guildId); // Ensure reset even if there are no members
      return;
    }

    const baseShare = totalTribute / membersCount;
    const leaderBonus = baseShare * 0.25;

    for (const memberId of guild.members) {
      let memberShare = baseShare;

      if (memberId === guild.guildLeader?.toString()) {
        memberShare += leaderBonus;
      }

      if (memberShare <= 0) {
        continue;
      }

      const memberCharacter = await Character.findById(memberId).lean<ICharacter>();
      if (memberCharacter) {
        memberShare = Math.min(memberShare, totalTribute); // Ensure member doesn't get more than total tribute

        console.log(`Distributing ${memberShare} gold to ${memberCharacter.name}`);
        this.socketMessaging.sendMessageToCharacter(
          memberCharacter,
          `💰 You received ${Math.round(memberShare)} gold coin(s) as your share of the guild tribute.`
        );

        await this.characterGold.addGoldToCharacterInventory(memberCharacter, memberShare);
      }
    }

    // Reset the tribute amount to 0 after distribution
    await this.resetTribute(guildId);
  }

  private async resetTribute(guildId: string): Promise<void> {
    await this.inMemoryHashTable.set(this.namespace, guildId, 0);
  }
}
