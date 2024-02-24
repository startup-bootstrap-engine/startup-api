import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ChatLog } from "@entities/ModuleSystem/ChatLogModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CharacterView } from "@providers/character/CharacterView";
import { appEnv } from "@providers/config/env";
import { RedisManager } from "@providers/database/RedisManager";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketTransmissionZone } from "@providers/sockets/SocketTransmissionZone";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { SpellCast } from "@providers/spells/SpellCast";
import {
  ChatMessageType,
  ChatSocketEvents,
  EnvType,
  GRID_HEIGHT,
  GRID_WIDTH,
  IChatMessageCreatePayload,
  IChatMessageReadPayload,
  SOCKET_TRANSMISSION_ZONE_WIDTH,
} from "@rpg-engine/shared";
import { Queue, Worker } from "bullmq";
import { provide } from "inversify-binding-decorators";
import { ChatUtils } from "./ChatUtils";

import { v4 as uuidv4 } from "uuid";

@provide(ChatNetworkGlobalMessaging)
export class ChatNetworkGlobalMessaging {
  private queue: Queue<any, any, string> | null = null;
  private worker: Worker | null = null;
  private connection: any;
  private queueName: string = `chat-global-messaging-${uuidv4()}-${
    appEnv.general.ENV === EnvType.Development ? "dev" : process.env.pm_id
  }`;

  constructor(
    private socketAuth: SocketAuth,
    private socketMessaging: SocketMessaging,
    private characterView: CharacterView,
    private socketTransmissionZone: SocketTransmissionZone,
    private spellCast: SpellCast,
    private characterValidation: CharacterValidation,
    private chatUtils: ChatUtils,
    private redisManager: RedisManager
  ) {}

  public initQueue(): void {
    if (!this.connection) {
      this.connection = this.redisManager.client;
    }

    if (!this.queue) {
      this.queue = new Queue(this.queueName, {
        connection: this.connection,
      });

      if (!appEnv.general.IS_UNIT_TEST) {
        this.queue.on("error", async (error) => {
          console.error(`Error in the ${this.queueName}:`, error);

          await this.queue?.close();
          this.queue = null;
        });
      }
    }

    if (!this.worker) {
      this.worker = new Worker(
        this.queueName,
        async (job) => {
          const { character, data } = job.data;

          await this.execGlobalMessaging(data, character);
        },
        {
          connection: this.connection,
        }
      );

      if (!appEnv.general.IS_UNIT_TEST) {
        this.worker.on("failed", async (job, err) => {
          console.log(`${this.queueName} job ${job?.id} failed with error ${err.message}`);

          await this.worker?.close();
          this.worker = null;
        });
      }
    }
  }

  public async addToQueue(data: IChatMessageCreatePayload, character: ICharacter): Promise<void> {
    if (!this.connection || !this.queue || !this.worker) {
      this.initQueue();
    }

    await this.queue?.add(
      this.queueName,
      {
        character,
        data,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  }

  public async shutdown(): Promise<void> {
    await this.queue?.close();
    await this.worker?.close();

    this.queue = null;
    this.worker = null;
  }

  public async clearAllJobs(): Promise<void> {
    try {
      if (!this.queue) {
        this.initQueue();
      }

      const jobs = (await this.queue?.getJobs(["waiting", "active", "delayed", "paused"])) ?? [];
      for (const job of jobs) {
        await job?.remove();
      }
    } catch (error) {
      console.error(error);
    }
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

    const chatLogsInView = await ChatLog.find({
      x: { $gte: socketTransmissionZone.x, $lte: socketTransmissionZone.width },
      y: { $gte: socketTransmissionZone.y, $lte: socketTransmissionZone.height },
      scene: character.scene,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const emitterIds = chatLogsInView.map((chatLog) => chatLog.emitter);
    const emitters = await Character.find({ _id: { $in: emitterIds } }, "name").lean();

    const emitterNameById = emitters.reduce((map, emitter) => {
      map[emitter._id.toString()] = emitter.name;
      return map;
    }, {});

    const chatLogs = chatLogsInView
      .map((chatLog) => ({
        _id: chatLog._id.toString(),
        message: chatLog.message,
        emitter: {
          // @ts-ignore
          _id: chatLog.emitter.toString(),
          // @ts-ignore
          name: emitterNameById[chatLog.emitter.toString()],
        },
        type: chatLog.type as ChatMessageType,
      }))
      .reverse();

    return {
      messages: chatLogs,
    };
  }
}
