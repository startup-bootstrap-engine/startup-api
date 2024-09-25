import { Character, type ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { GlobalChatLog } from "@entities/ModuleSystem/GlobalChatLogModal";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { SpellCast } from "@providers/spells/SpellCast";
import { ChatSocketEvents, IGlobalChatMessage } from "@rpg-engine/shared";
import { ChatNetworkBaseMessaging } from "./ChatNetworkBaseMessaging";
import { ChatUtils } from "./ChatUtils";

@provideSingleton(ChatNetworkGlobalMessagingQueue)
export class ChatNetworkGlobalMessagingQueue {
  constructor(
    private socketMessaging: SocketMessaging,
    private spellCast: SpellCast,
    private chatUtils: ChatUtils,
    private chatNetworkBaseMessaging: ChatNetworkBaseMessaging
  ) {}

  @TrackNewRelicTransaction()
  public onGlobalMessagingRead(channel: SocketChannel): void {
    this.chatNetworkBaseMessaging.registerReadEvent(
      channel,
      ChatSocketEvents.GlobalChatMessageRead,
      async (_data, character) => {
        try {
          const globalChatLogs = await GlobalChatLog.find({})
            .sort({ createdAt: -1 })
            .populate("emitter", "name")
            .limit(10)
            .lean();
          globalChatLogs.reverse();

          if (!globalChatLogs.length) {
            return;
          }

          const previousGlobalChatLogs = globalChatLogs.map((chatlog) => {
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

          this.socketMessaging.sendEventToAllUsers<IGlobalChatMessage[]>(
            ChatSocketEvents.GlobalChatMessageRead,
            previousGlobalChatLogs
          );
        } catch (error) {
          console.error(error);
          this.socketMessaging.sendErrorMessageToCharacter(character, "Error sending message");
        }
      }
    );
  }

  @TrackNewRelicTransaction()
  public onGlobalMessagingCreate(channel: SocketChannel): void {
    this.chatNetworkBaseMessaging.registerCreateEvent(
      channel,
      ChatSocketEvents.GlobalChatMessageCreate,
      // @ts-ignore
      async (data, character) => {
        try {
          //! REMOVE THIS LATER - NOT NEEDED. Requires client updates, otherwise it will break legacy ones.
          if (this.spellCast.isSpellCasting(data.message)) {
            const spellCharacter = (await Character.findById(character._id).lean()) as ICharacter;
            await this.spellCast.castSpell({ magicWords: data.message }, spellCharacter);
          }

          if (data.message.length > 0) {
            await GlobalChatLog.updateOne(
              { emitter: character._id, message: data.message },
              { $setOnInsert: { emitter: character._id, message: data.message } },
              { upsert: true }
            );

            const globalChatLogs = await GlobalChatLog.find({})
              .lean()
              .sort({ createdAt: -1 })
              .populate("emitter", "name")
              .limit(10);

            globalChatLogs.reverse();

            if (!globalChatLogs.length) {
              return [];
            }

            const previousGlobalChatLogs = globalChatLogs.map((chatlog) => {
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

            this.socketMessaging.sendEventToAllUsers<IGlobalChatMessage[]>(
              ChatSocketEvents.GlobalChatMessageRead,
              previousGlobalChatLogs
            );
          }
        } catch (error) {
          this.socketMessaging.sendErrorMessageToCharacter(character, "Error sending message");
        }
      }
    );
  }
}
