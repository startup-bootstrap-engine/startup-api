import { CharacterBuff } from "@entities/ModuleCharacter/CharacterBuffModel";
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterBuffActivator } from "@providers/character/characterBuff/CharacterBuffActivator";
import { GUILD_BUFFS, GUILD_LEVEL_BONUS, GUILD_LEVEL_BONUS_MAX } from "@providers/constants/GuildConstants";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { CharacterBuffDurationType, CharacterBuffType, ICharacterPermanentBuff } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(GuildLevelBonus)
export class GuildLevelBonus {
  constructor(private characterBuffActivator: CharacterBuffActivator, private socketMessaging: SocketMessaging) {}

  public async applyCharacterBuff(character: ICharacter, guildLevel: number): Promise<void> {
    try {
      let buffPercentage = guildLevel * GUILD_LEVEL_BONUS;

      if (buffPercentage >= GUILD_LEVEL_BONUS_MAX) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Guild level bonus has reached its maximum.");
        buffPercentage = GUILD_LEVEL_BONUS_MAX;
      }

      const activationMessage = `Guild level bonus of ${buffPercentage.toFixed(2)}% applied.`;
      const deactivationMessage = "Guild level bonus removed.";

      const existingBuffs = await CharacterBuff.find({
        owner: character._id,
        trait: { $in: GUILD_BUFFS },
        durationType: CharacterBuffDurationType.Permanent,
        originateFrom: "guild",
      }).lean();

      const applyBuffPromises = GUILD_BUFFS.map(async (trait) => {
        // eslint-disable-next-line mongoose-lean/require-lean
        const existingBuff = existingBuffs.find((buff) => buff.trait === trait);

        if (existingBuff) {
          await this.characterBuffActivator.disableBuff(character, existingBuff._id, CharacterBuffType.Skill, true);
        }

        const buff: ICharacterPermanentBuff = {
          type: CharacterBuffType.Skill,
          trait,
          buffPercentage,
          durationType: CharacterBuffDurationType.Permanent,
          skipAllMessages: false,
          skipDeactivationMessage: false,
          options: {
            messages: {
              activation: activationMessage,
              deactivation: deactivationMessage,
            },
          },
          originateFrom: "guild",
        } as ICharacterPermanentBuff;

        await this.characterBuffActivator.enablePermanentBuff(character, buff, false);
      });

      await Promise.all(applyBuffPromises);
    } catch (error) {
      console.error("Error applying character buff:", error);
    }
  }

  public async removeCharacterBuff(character: ICharacter): Promise<void> {
    try {
      const buffs = await CharacterBuff.find({
        owner: character._id,
        trait: { $in: GUILD_BUFFS },
        durationType: CharacterBuffDurationType.Permanent,
      })
        .lean()
        .select("_id trait");

      const removeBuffPromises = buffs.map(async (buff) => {
        if (buff._id) {
          await this.characterBuffActivator.disableBuff(character, buff._id, CharacterBuffType.Skill, false);
        }
      });

      await Promise.all(removeBuffPromises);
    } catch (error) {
      console.error("Error removing character buff:", error);
    }
  }
}
