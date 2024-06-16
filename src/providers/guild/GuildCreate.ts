import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { Guild } from "@entities/ModuleSystem/GuildModel";
import { GuildSkills } from "@entities/ModuleSystem/GuildSkillsModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterPremiumAccount } from "@providers/character/CharacterPremiumAccount";
import { CharacterTradingBalance } from "@providers/character/CharacterTradingBalance";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CharacterItemInventory } from "@providers/character/characterItems/CharacterItemInventory";
import { CharacterWeightQueue } from "@providers/character/weight/CharacterWeightQueue";
import { OthersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  GuildSocketEvents,
  IEquipmentAndInventoryUpdatePayload,
  IGuildForm,
  IGuildInfo,
  IItemContainer,
  ItemSocketEvents,
  UserAccountTypes,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { GuildGet } from "./GuildGet";

const MIN_GOLD_REQUIRED = 100000;

@provide(GuildCreate)
export class GuildCreate {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterValidation: CharacterValidation,
    private characterPremiumAccount: CharacterPremiumAccount,
    private characterTradingBalance: CharacterTradingBalance,
    private characterItemInventory: CharacterItemInventory,
    private characterWeight: CharacterWeightQueue,
    private guildGet: GuildGet,
    private characterInventory: CharacterInventory
  ) {}

  public async validateGuild(character: ICharacter): Promise<void> {
    const hasBasicValidation = this.characterValidation.hasBasicValidation(character);
    if (!hasBasicValidation) {
      return;
    }

    if (!(await this.isCharacterPremium(character))) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, you must be a premium user to create guilds."
      );
      return;
    }

    if (!(await this.isCharacterHasGold(character))) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, you must have at least " + MIN_GOLD_REQUIRED + " gold to create guilds."
      );
      return;
    }

    this.socketMessaging.sendEventToUser<boolean>(character.channelId!, GuildSocketEvents.CanCreateGuild, true);
  }

  private async isCharacterPremium(character: ICharacter): Promise<boolean> {
    const premiumAccountType = await this.characterPremiumAccount.getPremiumAccountType(character);
    return !!(premiumAccountType && premiumAccountType !== UserAccountTypes.Free);
  }

  private async isCharacterHasGold(character: ICharacter): Promise<boolean> {
    const availableGold = await this.characterTradingBalance.getTotalGoldInInventory(character);
    return availableGold >= MIN_GOLD_REQUIRED;
  }

  public async createGuild(guildData: IGuildForm, character: ICharacter): Promise<any> {
    try {
      // validate character
      await this.validateGuild(character);

      // is character already in a guild
      const guild = await this.guildGet.getCharactersGuild(character);
      if (guild) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, You are already in a guild.");
        return;
      }

      // check if guild name exists
      const guildExists = await Guild.findOne({
        $or: [{ name: guildData.guildName }, { tag: guildData.guildTag }],
      });

      if (guildExists) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, Guild name or tag already exists.");
        return;
      }

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

      // decrement gold
      const result = await this.characterItemInventory.decrementItemFromNestedInventoryByKey(
        OthersBlueprint.GoldCoin,
        character,
        MIN_GOLD_REQUIRED
      );

      if (result.success) {
        await this.updateCharacterWeight(character);
      }

      // send guild created message
      this.socketMessaging.sendMessageToCharacter(character, "Guild was Created successfully.");

      // send guild info
      const guildInfo = await this.guildGet.convertTOIGuildInfo(newGuild);
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

  private async updateCharacterWeight(character: ICharacter): Promise<void> {
    await this.characterWeight.updateCharacterWeight(character);
    const inventory = await this.characterInventory.getInventory(character);
    if (!inventory) return;

    const inventoryContainer = (await ItemContainer.findById(inventory.itemContainer).lean()) as IItemContainer | null;
    if (inventoryContainer) {
      const payloadUpdate: IEquipmentAndInventoryUpdatePayload = {
        inventory: inventoryContainer,
        openEquipmentSetOnUpdate: false,
        openInventoryOnUpdate: true,
      };

      this.socketMessaging.sendEventToUser<IEquipmentAndInventoryUpdatePayload>(
        character.channelId!,
        ItemSocketEvents.EquipmentAndInventoryUpdate,
        payloadUpdate
      );
    }
  }
}
