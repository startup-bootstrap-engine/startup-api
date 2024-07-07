/* eslint-disable mongoose-lean/require-lean */
import { Character, type ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TradeChatLog } from "@entities/ModuleSystem/TradeChatLogModal";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { DiscordBot } from "@providers/discord/DiscordBot";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { SpellCast } from "@providers/spells/SpellCast";
import { ChatSocketEvents, ITradeChatMessage, ITradeChatMessageCreatePayload } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { ChatUtils } from "./ChatUtils";

@provide(ChatNetworkTradeMessaging)
export class ChatNetworkTradeMessaging {
  constructor(
    private socketAuth: SocketAuth,
    private socketMessaging: SocketMessaging,
    private spellCast: SpellCast,
    private characterValidation: CharacterValidation,
    private chatUtils: ChatUtils,
    private discordBot: DiscordBot
  ) {}

  @TrackNewRelicTransaction()
  public onTradeMessagingRead(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      ChatSocketEvents.TradeChatMessageRead,
      async (data: { limit: number }, character: ICharacter) => {
        try {
          const canChat = this.characterValidation.hasBasicValidation(character);

          if (!canChat) {
            return;
          }

          const tradeChatLogs = await TradeChatLog.find({})
            .sort({ createdAt: -1 })
            .populate("emitter", "name")
            .limit(data.limit);

          tradeChatLogs.reverse();

          if (!tradeChatLogs.length) {
            return [];
          }

          const previousTradeChatLogs = tradeChatLogs.map((chatlog) => {
            const emitter = chatlog.emitter as ICharacter;

            return {
              _id: chatlog._id,
              emitter: {
                _id: emitter._id,
                name: emitter.name,
              },
              message: chatlog.message,
            };
          });

          this.socketMessaging.sendEventToAllUsers<ITradeChatMessage[]>(
            ChatSocketEvents.TradeChatMessageRead,
            previousTradeChatLogs
          );
        } catch (error) {
          this.socketMessaging.sendErrorMessageToCharacter(character, "Error sending message");
        }
      }
    );
  }

  @TrackNewRelicTransaction()
  public onTradeMessagingCreate(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      ChatSocketEvents.TradeChatMessageCreate,
      async (data: ITradeChatMessageCreatePayload, character: ICharacter) => {
        try {
          const canChat = this.characterValidation.hasBasicValidation(character);

          if (!canChat) {
            return;
          }

          if (data.message.startsWith("/")) {
            await this.chatUtils.handleAdminCommand(data.message.substring(1), character);
            return;
          }

          if (this.spellCast.isSpellCasting(data.message)) {
            const spellCharacter = (await Character.findById(character._id)) as ICharacter;
            await this.spellCast.castSpell({ magicWords: data.message }, spellCharacter);
          }

          if (data.message.length > 200) {
            this.socketMessaging.sendErrorMessageToCharacter(
              character,
              "Chat message is too long, maximum is 200 characters"
            );
            return;
          }

          if (data.message.length > 0) {
            data = this.chatUtils.replaceProfanity(data);

            const tradeChatLog = new TradeChatLog({
              message: data.message,
              emitter: character._id,
            });

            await tradeChatLog.save();

            const tradeChatLogs = await TradeChatLog.find({})
              .sort({ createdAt: -1 })
              .populate("emitter", "name")
              .limit(data.limit);

            tradeChatLogs.reverse();

            if (!tradeChatLogs.length) {
              return [];
            }

            const previousTradeChatLogs = tradeChatLogs.map((chatlog) => {
              const emitter = chatlog.emitter as ICharacter;

              return {
                _id: chatlog._id,
                emitter: {
                  _id: emitter._id,
                  name: emitter.name,
                },
                message: chatlog.message,
              };
            });

            this.socketMessaging.sendEventToAllUsers<ITradeChatMessage[]>(
              ChatSocketEvents.TradeChatMessageRead,
              previousTradeChatLogs
            );

            await this.discordBot.sendMessage(
              `${character.name}: ${data.message}.
            
            * Send me a private in-game message to reply.`,
              "trade"
            );
          }
        } catch (error) {
          this.socketMessaging.sendErrorMessageToCharacter(character, "Error sending message");
        }
      }
    );
  }
}
