/* eslint-disable mongoose-lean/require-lean */
import { type ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TradeChatLog } from "@entities/ModuleSystem/TradeChatLogModal";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { DiscordBot } from "@providers/discord/DiscordBot";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { ChatSocketEvents, ITradeChatMessage, ITradeChatMessageCreatePayload } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { ChatNetworkBaseMessaging } from "./ChatNetworkBaseMessaging";
import { ChatUtils } from "./ChatUtils";

@provide(ChatNetworkTradeMessaging)
export class ChatNetworkTradeMessaging {
  constructor(
    private socketMessaging: SocketMessaging,

    private chatUtils: ChatUtils,
    private discordBot: DiscordBot,
    private chatNetworkBaseMessaging: ChatNetworkBaseMessaging
  ) {}

  @TrackNewRelicTransaction()
  public onTradeMessagingRead(channel: SocketChannel): void {
    this.chatNetworkBaseMessaging.registerReadEvent(
      channel,
      ChatSocketEvents.TradeChatMessageRead,
      // @ts-ignore
      async (data: { limit: number }, character: ICharacter) => {
        try {
          const tradeChatLogs = await TradeChatLog.find({})
            .sort({ createdAt: -1 })
            .populate("emitter", "name")
            .limit(10);

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
          console.error(error);
          this.socketMessaging.sendErrorMessageToCharacter(character, "Error sending message");
        }
      }
    );
  }

  @TrackNewRelicTransaction()
  public onTradeMessagingCreate(channel: SocketChannel): void {
    this.chatNetworkBaseMessaging.registerCreateEvent(
      channel,
      ChatSocketEvents.TradeChatMessageCreate,
      // @ts-ignore
      async (data: ITradeChatMessageCreatePayload, character: ICharacter) => {
        try {
          if (data.message.startsWith("/")) {
            await this.chatUtils.handleAdminCommand(data.message.substring(1), character);
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
              .limit(10);

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
