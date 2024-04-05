import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { appEnv } from "@providers/config/env";
import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { QueueActivityMonitor } from "@providers/queue/QueueActivityMonitor";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { EnvType, ISpellCast, SpellSocketEvents } from "@rpg-engine/shared";
import { Queue, Worker } from "bullmq";
import { v4 as uuidv4 } from "uuid";
import { SpellCast } from "../SpellCast";

@provideSingleton(SpellNetworkCastQueue)
export class SpellNetworkCastQueue {
  private queue: Queue<any, any, string> | null = null;
  private worker: Worker | null = null;
  private connection: any;
  private queueName: string = `spell-queue-${uuidv4()}-${
    appEnv.general.ENV === EnvType.Development ? "dev" : process.env.pm_id
  }`;

  constructor(
    private socketAuth: SocketAuth,
    private spellCast: SpellCast,
    private redisManager: RedisManager,
    private queueActivityMonitor: QueueActivityMonitor
  ) {}

  public onSpellCast(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      SpellSocketEvents.CastSpell,
      async (data: ISpellCast, character: ICharacter) => {
        if (!character._id) {
          throw new Error("Character ID not found");
        }

        if (character.health <= 0) {
          throw new Error("Character is not alive");
        }

        if (!data || !character) {
          return;
        }

        await this.addToQueue(data, character);
      },
      true
    );
  }

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

          if (!data || !character) {
            console.error(
              `Error processing ${this.queueName} for Character ${character.name}:`,
              "No data or character"
            );
            return;
          }

          try {
            await this.queueActivityMonitor.updateQueueActivity(this.queueName);

            await this.spellCast.castSpell(data, character);
          } catch (err) {
            console.error(`Error processing ${this.queueName} for Character ${character.name}:`, err);
            throw err;
          }
        },
        {
          name: `${this.queueName}-worker`,
          connection: this.connection,
        }
      );

      if (!appEnv.general.IS_UNIT_TEST) {
        this.worker.on("failed", async (job, err) => {
          console.info(`${this.queueName} job ${job?.id} failed with error ${err.message}`);

          await this.worker?.close();
          this.worker = null;
        });
      }
    }
  }

  public async addToQueue(data: ISpellCast, character: ICharacter): Promise<void> {
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
}
