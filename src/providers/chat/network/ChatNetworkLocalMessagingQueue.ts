import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ChatLog } from "@entities/ModuleSystem/ChatLogModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterView } from "@providers/character/CharacterView";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketTransmissionZone } from "@providers/sockets/SocketTransmissionZone";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import {
  ChatMessageType,
  ChatSocketEvents,
  GRID_HEIGHT,
  GRID_WIDTH,
  ILocalChatMessageCreatePayload,
  ILocalChatMessageReadPayload,
  SOCKET_TRANSMISSION_ZONE_WIDTH,
} from "@rpg-engine/shared";
import { ChatNetworkBaseMessaging } from "./ChatNetworkBaseMessaging";
import { ChatUtils } from "./ChatUtils";

@provideSingleton(ChatNetworkLocalMessagingQueue)
export class ChatNetworkLocalMessagingQueue {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterView: CharacterView,
    private socketTransmissionZone: SocketTransmissionZone,
    private chatUtils: ChatUtils,
    private dynamicQueue: DynamicQueue,
    private chatNetworkBaseMessaging: ChatNetworkBaseMessaging // Add this line
  ) {}

  public async addToQueue(data: ILocalChatMessageCreatePayload, character: ICharacter): Promise<void> {
    await this.dynamicQueue.addJob(
      "chat-local-messaging",
      (job) => {
        const { data, character } = job.data;

        void this.execLocalMessaging(data, character);
      },
      {
        character,
        data,
      }
    );
  }

  public async clearAllJobs(): Promise<void> {
    await this.dynamicQueue.clearAllJobs();
  }

  public async shutdown(): Promise<void> {
    await this.dynamicQueue.shutdown();
  }

  @TrackNewRelicTransaction()
  public onLocalMessaging(channel: SocketChannel): void {
    this.chatNetworkBaseMessaging.registerCreateEvent(
      channel,
      ChatSocketEvents.LocalChatMessageCreate,
      async (data: ILocalChatMessageCreatePayload, character: ICharacter) => {
        await this.addToQueue(data, character);
      }
    );
  }

  @TrackNewRelicTransaction()
  private async execLocalMessaging(data: ILocalChatMessageCreatePayload, character: ICharacter): Promise<void> {
    try {
      const charactersInViewPromise = this.characterView.getCharactersInView(character as ICharacter);

      // eslint-disable-next-line no-unused-vars
      const [nearbyCharacters] = await Promise.all([charactersInViewPromise]);

      if (data.message.length > 0) {
        const chatLog = new ChatLog({
          message: data.message,
          emitter: character._id,
          type: data.type,
          x: character.x,
          y: character.y,
          scene: character.scene,
        });

        // eslint-disable-next-line mongoose-lean/require-lean
        await chatLog.save();

        const chatLogs = await this.getChatLogsInZone(character);

        this.sendMessagesToNearbyCharacters(chatLogs, nearbyCharacters);
        this.chatUtils.sendMessagesToCharacter(chatLogs, character, ChatSocketEvents.LocalChatMessageRead);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private sendMessagesToNearbyCharacters(chatLogs: ILocalChatMessageReadPayload, nearbyCharacters: ICharacter[]): void {
    for (const nearbyCharacter of nearbyCharacters) {
      const isValidCharacterTarget = this.chatUtils.shouldCharacterReceiveMessage(nearbyCharacter);

      if (isValidCharacterTarget) {
        this.socketMessaging.sendEventToUser<ILocalChatMessageReadPayload>(
          nearbyCharacter.channelId!,
          ChatSocketEvents.LocalChatMessageRead,
          chatLogs
        );
      }
    }
  }

  @TrackNewRelicTransaction()
  public async getChatLogsInZone(character: ICharacter): Promise<ILocalChatMessageReadPayload> {
    const socketTransmissionZone = this.socketTransmissionZone.calculateSocketTransmissionZone(
      character.x,
      character.y,
      GRID_WIDTH,
      GRID_HEIGHT,
      SOCKET_TRANSMISSION_ZONE_WIDTH,
      SOCKET_TRANSMISSION_ZONE_WIDTH
    );

    const chatLogsInView = await ChatLog.aggregate([
      {
        $match: {
          x: { $gte: socketTransmissionZone.x, $lte: socketTransmissionZone.width },
          y: { $gte: socketTransmissionZone.y, $lte: socketTransmissionZone.height },
          scene: character.scene,
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "characters",
          localField: "emitter",
          foreignField: "_id",
          as: "emitter",
        },
      },
      { $unwind: "$emitter" },
      {
        $project: {
          _id: 1,
          message: 1,
          type: 1,
          "emitter._id": 1,
          "emitter.name": 1,
        },
      },
    ]);

    const chatLogs = chatLogsInView
      .map((chatLog) => ({
        _id: chatLog._id.toString(),
        message: chatLog.message,
        emitter: {
          _id: chatLog.emitter._id.toString(),
          name: chatLog.emitter.name,
        },
        type: chatLog.type as ChatMessageType,
      }))
      .reverse();

    return {
      messages: chatLogs,
    };
  }
}
