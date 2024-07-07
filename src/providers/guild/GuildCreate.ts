/* eslint-disable mongoose-lean/require-lean */
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild } from "@entities/ModuleSystem/GuildModel";
import { GuildSkills } from "@entities/ModuleSystem/GuildSkillsModel";
import { CharacterPremiumAccount } from "@providers/character/CharacterPremiumAccount";
import { CharacterTradingBalance } from "@providers/character/CharacterTradingBalance";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CharacterItemInventory } from "@providers/character/characterItems/CharacterItemInventory";
import { CharacterWeightQueue } from "@providers/character/weight/CharacterWeightQueue";
import { GUILD_CREATE_MIN_GOLD_REQUIRED } from "@providers/constants/GuildConstants";
import { OthersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { GuildSocketEvents, IGuildForm, IGuildInfo } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { GuildCommon } from "./GuildCommon";
import { GuildValidation } from "./GuildValidation";

@provide(GuildCreate)
export class GuildCreate {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterValidation: CharacterValidation,
    private characterPremiumAccount: CharacterPremiumAccount,
    private characterTradingBalance: CharacterTradingBalance,
    private characterItemInventory: CharacterItemInventory,
    private characterWeight: CharacterWeightQueue,
    private guildCommon: GuildCommon,
    private guildValidation: GuildValidation
  ) {}

  public async createGuild(guildData: IGuildForm, character: ICharacter): Promise<any> {
    try {
      // validate character
      await this.validateGuild(character);

      // is character already in a guild
      const guild = await this.guildCommon.getCharactersGuild(character);
      if (guild) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, You are already in a guild.");
        return;
      }

      // validate guild name and tag
      const nameValidation = this.guildValidation.validateGuildName(guildData.guildName);
      if (!nameValidation.isValid) {
        this.socketMessaging.sendErrorMessageToCharacter(character, nameValidation.message!);
        return;
      }

      const tagValidation = this.guildValidation.validateGuildTag(guildData.guildTag);
      if (!tagValidation.isValid) {
        this.socketMessaging.sendErrorMessageToCharacter(character, tagValidation.message!);
        return;
      }

      // check if guild name or tag exists
      const guildExists = await Guild.findOne({
        $or: [{ name: guildData.guildName }, { tag: guildData.guildTag }],
      });

      if (guildExists) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, Guild name or tag already exists.");
        return;
      }

      // decrement gold
      const result = await this.characterItemInventory.decrementItemFromNestedInventoryByKey(
        OthersBlueprint.GoldCoin,
        character,
        GUILD_CREATE_MIN_GOLD_REQUIRED
      );

      if (!result.success) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          `Sorry, not enough gold to create guild. You need at least ${GUILD_CREATE_MIN_GOLD_REQUIRED}.`
        );
        return;
      }

      await this.characterWeight.refreshContainersAfterWeightChange(character);

      // create guild
      const newGuild = await Guild.create({
        guildLeader: character._id,
        members: [character._id],
        name: guildData.guildName,
        tag: guildData.guildTag,
        coatOfArms: guildData.guildCoatOfArms,
      });

      // create guild skills
      const newSkills = await GuildSkills.create({ owner: newGuild._id });
      newGuild.guildSkills = newSkills;
      await newGuild.save();

      // send guild created message
      this.socketMessaging.sendMessageToCharacter(character, "Guild was Created successfully.");

      // send guild info
      const guildInfo = await this.guildCommon.convertToGuildInfo(newGuild);
      this.socketMessaging.sendEventToUser<IGuildInfo>(
        character.channelId!,
        GuildSocketEvents.GuildInfoOpen,
        guildInfo
      );
    } catch (error) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Error creating guild.");
      console.error(error);
    }
  }

  private async validateGuild(character: ICharacter): Promise<void> {
    const hasBasicValidation = this.characterValidation.hasBasicValidation(character);
    if (!hasBasicValidation) {
      return;
    }

    if (!(await this.characterPremiumAccount.isCharacterPremium(character))) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, you must be a premium user to create guilds."
      );
      return;
    }

    if (!(await this.isCharacterHasGold(character))) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, you must have at least " + GUILD_CREATE_MIN_GOLD_REQUIRED + " gold to create guilds."
      );
      return;
    }

    this.socketMessaging.sendEventToUser<boolean>(character.channelId!, GuildSocketEvents.CanCreateGuild, true);
  }

  private async isCharacterHasGold(character: ICharacter): Promise<boolean> {
    const availableGold = await this.characterTradingBalance.getTotalGoldInInventory(character);
    return availableGold >= GUILD_CREATE_MIN_GOLD_REQUIRED;
  }
}
