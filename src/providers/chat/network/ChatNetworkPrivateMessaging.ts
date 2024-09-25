/* eslint-disable mongoose-lean/require-lean */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { PrivateChatLog } from "@entities/ModuleSystem/PrivateChatLogModal";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { ChatMessageStatus, ChatSocketEvents, IPrivateChatMessageReadResponse } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { ChatNetworkBaseMessaging } from "./ChatNetworkBaseMessaging";
import { ChatUtils } from "./ChatUtils";

interface IUnseenSendersResponse {
  characters: ICharacter[];
}

const MAX_MESSAGES_PER_CHARACTER = 20;
@provide(ChatNetworkPrivateMessaging)
export class ChatNetworkPrivateMessaging {
  constructor(
    private socketAuth: SocketAuth,
    private socketMessaging: SocketMessaging,
    private chatBaseNetworkMessaging: ChatNetworkBaseMessaging, // Keep the existing instance
    private characterValidation: CharacterValidation,
    private chatUtils: ChatUtils
  ) {}

  @TrackNewRelicTransaction()
  public onPrivateMessaging(channel: SocketChannel): void {
    this.chatBaseNetworkMessaging.registerCreateEvent(
      channel,
      ChatSocketEvents.PrivateChatMessageCreate,
      async (data, character) => {
        const receiverCharacter = await Character.findById(data.receiver._id);

        if (!receiverCharacter) {
          return;
        }

        if (data.message.length > 0) {
          await this.saveChatLog(data.message, character._id, receiverCharacter._id);
          const chatLogs = await this.getPreviousChatLogs(character, receiverCharacter);
          this.chatUtils.sendMessagesToCharacter(chatLogs, character, ChatSocketEvents.PrivateChatMessageRead);
          this.chatUtils.sendMessagesToCharacter(chatLogs, receiverCharacter, ChatSocketEvents.PrivateChatMessageRead);
        }
      }
    );

    this.chatBaseNetworkMessaging.registerReadEvent(
      channel,
      ChatSocketEvents.PrivateChatMessageRead,
      async (data, character) => {
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
      }
    );

    this.chatBaseNetworkMessaging.registerReadEvent(
      channel,
      ChatSocketEvents.PrivateChatMessageGetUnseenMessageCharacters,
      async (_, character) => {
        const unseenMessages = await PrivateChatLog.find({
          status: ChatMessageStatus.Unseen,
          receiver: character._id,
        })
          .sort({ createdAt: -1 })
          .limit(10);
        const uniqueSenderIds = [...new Set(unseenMessages.map((message) => message.emitter))];
        const unseenSenders = await Character.find({ _id: { $in: uniqueSenderIds } }, "name");
        this.socketMessaging.sendEventToUser<IUnseenSendersResponse>(
          character.channelId!,
          ChatSocketEvents.PrivateChatMessageGetUnseenMessageCharacters,
          {
            characters: unseenSenders,
          }
        );
      }
    );
  }

  @TrackNewRelicTransaction()
  private async getPreviousChatLogs(
    sender: ICharacter,
    receiver: ICharacter
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
      .limit(20);

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
  private async saveChatLog(message: string, emitterId: string, receiverId: string): Promise<void> {
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
