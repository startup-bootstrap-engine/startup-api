import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { PrivateChatLog } from "@entities/ModuleSystem/PrivateChatLogModal";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { SpellCast } from "@providers/spells/SpellCast";
import {
  ChatMessageStatus,
  ChatSocketEvents,
  IPrivateChatMessageCreatePayload,
  IPrivateChatMessageReadPayload,
  IPrivateChatMessageReadResponse,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { IPrivateChatFindCharacterResponse } from "./ChatNetworkFindCharacter";
import { ChatUtils } from "./ChatUtils";

const MAX_MESSAGES_PER_CHARACTER = 20;
@provide(ChatNetworkPrivateMessaging)
export class ChatNetworkPrivateMessaging {
  constructor(
    private socketAuth: SocketAuth,
    private socketMessaging: SocketMessaging,
    private spellCast: SpellCast,
    private characterValidation: CharacterValidation,
    private chatUtils: ChatUtils
  ) {}

  @TrackNewRelicTransaction()
  public onPrivateMessaging(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      ChatSocketEvents.PrivateChatMessageCreate,
      async (data: IPrivateChatMessageCreatePayload, character: ICharacter) => {
        try {
          const receiverCharacter = await Character.findById(data.receiver._id);
          const canChat = this.characterValidation.hasBasicValidation(character);

          if (!canChat || !receiverCharacter) {
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

          if (data.message.length >= 200) {
            this.socketMessaging.sendErrorMessageToCharacter(
              character,
              "Chat message is too long, maximum is 200 characters"
            );
          }

          if (data.message.length > 0) {
            data = this.chatUtils.replaceProfanity(data);

            await this.saveChatLog(data.message, character._id, receiverCharacter._id);

            const chatLogs = await this.getPreviousChatLogs(character, receiverCharacter, data.limit);

            this.chatUtils.sendMessagesToCharacter(chatLogs, character, ChatSocketEvents.PrivateChatMessageRead);
            this.chatUtils.sendMessagesToCharacter(
              chatLogs,
              receiverCharacter,
              ChatSocketEvents.PrivateChatMessageRead
            );
          }
        } catch (error) {
          console.log(error);
        }
      }
    );

    this.socketAuth.authCharacterOn(
      channel,
      ChatSocketEvents.PrivateChatMessageRead,
      async (data: IPrivateChatMessageReadPayload, character: ICharacter) => {
        try {
          const receiverCharacter = await Character.findById(data.receiverId);
          const canChat = this.characterValidation.hasBasicValidation(character);

          if (!canChat || !receiverCharacter) {
            return;
          }

          const unseenMessages = await PrivateChatLog.find({
            status: ChatMessageStatus.Unseen,
            receiver: character._id,
          });

          await PrivateChatLog.updateMany(
            { _id: { $in: unseenMessages.map((message) => message._id) } },
            { $set: { status: ChatMessageStatus.Seen } }
          );

          const chatLogs = await this.getPreviousChatLogs(character, receiverCharacter);
          this.chatUtils.sendMessagesToCharacter(chatLogs, character, ChatSocketEvents.PrivateChatMessageRead);
          this.chatUtils.sendMessagesToCharacter(chatLogs, receiverCharacter, ChatSocketEvents.PrivateChatMessageRead);
        } catch (error) {
          console.log(error);
        }
      }
    );

    this.socketAuth.authCharacterOn(
      channel,
      ChatSocketEvents.PrivateChatMessageGetUnseenMessageCharacters,
      async (_, character: ICharacter) => {
        try {
          const unseenMessages = await PrivateChatLog.find({
            status: ChatMessageStatus.Unseen,
            receiver: character._id,
          })
            .sort({ createdAt: -1 })
            .limit(10);
          const uniqueSenderIds = [...new Set(unseenMessages.map((message) => message.emitter))];
          const unseenSenders = await Character.find({ _id: { $in: uniqueSenderIds } }, "name");
          console.log("unseenSenders", unseenSenders);
          this.socketMessaging.sendEventToUser<IPrivateChatFindCharacterResponse>(
            character.channelId!,
            ChatSocketEvents.PrivateChatMessageGetUnseenMessageCharacters,
            {
              characters: unseenSenders,
            }
          );
        } catch (error) {
          console.error("Error fetching unseen messages:", error);
        }
      }
    );
  }

  @TrackNewRelicTransaction()
  private async getPreviousChatLogs(
    sender: ICharacter,
    receiver: ICharacter,
    limit: number = 20
  ): Promise<IPrivateChatMessageReadResponse> {
    const privatePreviousChatLogs = await PrivateChatLog.find({
      $or: [
        {
          emitter: sender._id,
          receiver: receiver._id,
        },
        {
          emitter: receiver._id,
          receiver: sender._id,
        },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("emitter", "name")
      .limit(limit);

    privatePreviousChatLogs.reverse();

    if (privatePreviousChatLogs.length === 0) {
      return {
        messages: [],
      };
    }

    const privateChatLogs = privatePreviousChatLogs.map((chatLog) => {
      const emitter = chatLog.emitter as unknown as ICharacter;

      return {
        _id: chatLog._id,
        message: chatLog.message,
        emitter: {
          _id: emitter._id as string,
          name: emitter.name,
        },
        receiver: {
          _id: receiver._id as string,
          name: receiver.name,
        },
        status: chatLog.status as ChatMessageStatus,
        createdAt: chatLog.createdAt,
      };
    });

    return {
      messages: privateChatLogs,
    };
  }

  @TrackNewRelicTransaction()
  private async saveChatLog(message, emitterId, receiverId): Promise<void> {
    const chatLogs = await PrivateChatLog.find({
      emitter: emitterId,
    })
      .sort({ createdAt: -1 })
      .limit(MAX_MESSAGES_PER_CHARACTER);

    if (chatLogs.length >= MAX_MESSAGES_PER_CHARACTER) {
      const oldestMessage = chatLogs[chatLogs.length - 1];
      await PrivateChatLog.findByIdAndDelete({ _id: oldestMessage._id });
    }

    const newChatLog = new PrivateChatLog({
      message: message,
      emitter: emitterId,
      receiver: receiverId,
      status: ChatMessageStatus.Unseen,
    });

    await newChatLog.save();
  }
}
