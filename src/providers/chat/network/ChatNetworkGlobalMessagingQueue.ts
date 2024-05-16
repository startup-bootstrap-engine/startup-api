import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ChatLog } from "@entities/ModuleSystem/ChatLogModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CharacterView } from "@providers/character/CharacterView";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketTransmissionZone } from "@providers/sockets/SocketTransmissionZone";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { SpellCast } from "@providers/spells/SpellCast";
import {
  ChatMessageType,
  ChatSocketEvents,
  GRID_HEIGHT,
  GRID_WIDTH,
  IChatMessageCreatePayload,
  IChatMessageReadPayload,
  SOCKET_TRANSMISSION_ZONE_WIDTH,
} from "@rpg-engine/shared";
import { ChatUtils } from "./ChatUtils";

import { provideSingleton } from "@providers/inversify/provideSingleton";
import { DynamicQueue } from "@providers/queue/DynamicQueue";

@provideSingleton(ChatNetworkGlobalMessagingQueue)
export class ChatNetworkGlobalMessagingQueue {
  constructor(
    private socketAuth: SocketAuth,
    private socketMessaging: SocketMessaging,
    private characterView: CharacterView,
    private socketTransmissionZone: SocketTransmissionZone,
    private spellCast: SpellCast,
    private characterValidation: CharacterValidation,
    private chatUtils: ChatUtils,
    private dynamicQueue: DynamicQueue
  ) {}

  public async addToQueue(data: IChatMessageCreatePayload, character: ICharacter): Promise<void> {
    await this.dynamicQueue.addJob(
      "chat-global-messaging",
      async (job) => {
        const { data, character } = job.data;

        return await this.execGlobalMessaging(data, character);
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
  public onGlobalMessaging(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      ChatSocketEvents.GlobalChatMessageCreate,
      async (data: IChatMessageCreatePayload, character: ICharacter) => {
        await this.addToQueue(data, character);
      }
    );
  }

  @TrackNewRelicTransaction()
  private async execGlobalMessaging(data: IChatMessageCreatePayload, character: ICharacter): Promise<void> {
    try {
      const canChat = this.characterValidation.hasBasicValidation(character);

      if (!canChat) {
        return;
      }

      if (data.message.startsWith("/")) {
        await this.chatUtils.handleAdminCommand(data.message.substring(1), character);
        return;
      }

      let spellCastPromise;
      if (this.spellCast.isSpellCasting(data.message)) {
        const spellCharacter = (await Character.findById(character._id).lean({
          virtuals: true,
          defaults: true,
        })) as ICharacter;

        spellCastPromise = this.spellCast.castSpell({ magicWords: data.message }, spellCharacter);
      }

      const charactersInViewPromise = this.characterView.getCharactersInView(character as ICharacter);

      // eslint-disable-next-line no-unused-vars
      const [_, nearbyCharacters] = await Promise.all([spellCastPromise, charactersInViewPromise]);

      if (data.message.length >= 200) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Chat message is too long, maximum is 200 characters"
        );
        return;
      }

      if (data.message.length > 0) {
        data = this.chatUtils.replaceProfanity(data);

        const chatLog = new ChatLog({
          message: data.message,
          emitter: character._id,
          type: data.type,
          x: character.x,
          y: character.y,
          scene: character.scene,
        });

        await chatLog.save();

        const chatLogs = await this.getChatLogsInZone(character, data.limit);

        this.sendMessagesToNearbyCharacters(chatLogs, nearbyCharacters);
        this.chatUtils.sendMessagesToCharacter(chatLogs, character, ChatSocketEvents.GlobalChatMessageRead);
      }
    } catch (error) {
      console.error(error);
    }
  }

  private sendMessagesToNearbyCharacters(chatLogs: IChatMessageReadPayload, nearbyCharacters: ICharacter[]): void {
    for (const nearbyCharacter of nearbyCharacters) {
      const isValidCharacterTarget = this.chatUtils.shouldCharacterReceiveMessage(nearbyCharacter);

      if (isValidCharacterTarget) {
        this.socketMessaging.sendEventToUser<IChatMessageReadPayload>(
          nearbyCharacter.channelId!,
          ChatSocketEvents.GlobalChatMessageRead,
          chatLogs
        );
      }
    }
  }

  @TrackNewRelicTransaction()
  public async getChatLogsInZone(character: ICharacter, limit: number = 20): Promise<IChatMessageReadPayload> {
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
      { $limit: limit },
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
