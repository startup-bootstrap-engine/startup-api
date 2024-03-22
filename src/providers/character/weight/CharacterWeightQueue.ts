import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  BasicAttribute,
  CharacterClass,
  CharacterSocketEvents,
  EnvType,
  ICharacterAttributeChanged,
} from "@rpg-engine/shared";

import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { QueueCleaner } from "@providers/queue/QueueCleaner";
import { TraitGetter } from "@providers/skill/TraitGetter";
import { Job, Queue, Worker } from "bullmq";
import { CharacterWeightCalculator } from "./CharacterWeightCalculator";

@provideSingleton(CharacterWeightQueue)
export class CharacterWeightQueue {
  private queue: Queue<any, any, string> | null = null;
  private worker: Worker | null = null;
  private connection: any;

  private queueName = (scene: string): string =>
    `character-weight-${appEnv.general.ENV === EnvType.Development ? "dev" : process.env.pm_id}-${scene}`;

  constructor(
    private socketMessaging: SocketMessaging,
    private traitGetter: TraitGetter,
    private inMemoryHashTable: InMemoryHashTable,
    private characterWeightCalculator: CharacterWeightCalculator,
    private redisManager: RedisManager,
    private queueCleaner: QueueCleaner
  ) {}

  public init(scene: string): void {
    if (appEnv.general.IS_UNIT_TEST) {
      return;
    }

    if (!this.connection) {
      this.connection = this.redisManager.client;
    }

    if (!this.queue) {
      this.queue = new Queue(this.queueName(scene), {
        connection: this.connection,
      });

      if (!appEnv.general.IS_UNIT_TEST) {
        this.queue.on("error", async (error) => {
          console.error("Error in the pathfindingQueue:", error);

          await this.queue?.close();
          this.queue = null;
        });
      }
    }

    if (!this.worker) {
      this.worker = new Worker(
        this.queueName(scene),
        async (job) => {
          const { character } = job.data;

          try {
            await this.queueCleaner.updateQueueActivity(this.queueName(scene));

            await this.execUpdateCharacterWeight(character);
          } catch (err) {
            console.error(
              `Error processing ${this.queueName} for character ${character._id} (${character.name}):`,
              err
            );
            throw err;
          }
        },
        {
          connection: this.connection,
        }
      );

      if (!appEnv.general.IS_UNIT_TEST) {
        this.worker.on("failed", async (job, err) => {
          console.log(`Pathfinding job ${job?.id} failed with error ${err.message}`);

          await this.worker?.close();
          this.worker = null;
        });
      }
    }
  }

  public async clearAllJobs(): Promise<void> {
    const jobs = (await this.queue?.getJobs(["waiting", "active", "delayed", "paused"])) ?? [];
    for (const job of jobs) {
      try {
        await job?.remove();
      } catch (err) {
        console.error(`Error removing job ${job?.id}:`, err.message);
      }
    }
  }

  async updateCharacterWeight(character: ICharacter): Promise<Job | undefined> {
    if (!this.connection || !this.queue || !this.worker) {
      this.init(character.scene);
    }

    if (appEnv.general.IS_UNIT_TEST) {
      await this.execUpdateCharacterWeight(character);
      return;
    }

    try {
      return await this.queue?.add(
        this.queueName(character.scene),
        {
          character,
        },
        {
          removeOnComplete: true,
          removeOnFail: true,
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  public async shutdown(): Promise<void> {
    await this.queue?.close();
    await this.worker?.close();
    this.queue = null;
    this.worker = null;
  }

  @TrackNewRelicTransaction()
  public async execUpdateCharacterWeight(character: ICharacter): Promise<void> {
    await this.inMemoryHashTable.delete("character-max-weights", character._id);

    const weight = await this.getWeight(character);
    const maxWeight = await this.getMaxWeight(character);

    await Character.updateOne(
      {
        _id: character._id,
      },
      {
        $set: {
          weight,
          maxWeight,
        },
      }
    );

    //! Requires virtuals
    character = (await Character.findById(character._id).lean({ virtuals: true, defaults: true })) || character;

    this.socketMessaging.sendEventToUser<ICharacterAttributeChanged>(
      character.channelId!,
      CharacterSocketEvents.AttributeChanged,
      {
        speed: character.speed,
        weight,
        maxWeight,
        targetId: character._id,
      }
    );
  }

  @TrackNewRelicTransaction()
  public async getMaxWeight(character: ICharacter): Promise<number> {
    const maxWeight = (await this.inMemoryHashTable.get("character-max-weights", character._id)) as unknown as number;

    if (maxWeight) {
      return maxWeight;
    }

    const calculatedMaxWeight = await this.calculateMaxWeight(character);

    await this.inMemoryHashTable.set("character-max-weights", character._id, calculatedMaxWeight);

    return calculatedMaxWeight;
  }

  private async calculateMaxWeight(character: ICharacter): Promise<number> {
    const skills = (await Skill.findById(character.skills)
      .lean()
      .cacheQuery({
        cacheKey: `${character?._id}-skills`,
      })) as unknown as ISkill;

    if (skills) {
      if (character.class === CharacterClass.Sorcerer || character.class === CharacterClass.Druid) {
        const magicLvl = await this.traitGetter.getSkillLevelWithBuffs(skills as ISkill, BasicAttribute.Magic);

        return magicLvl * 15;
      }

      const strengthLvl = await this.traitGetter.getSkillLevelWithBuffs(skills as ISkill, BasicAttribute.Strength);

      return strengthLvl * 15;
    } else {
      return 15;
    }
  }

  @TrackNewRelicTransaction()
  public async getWeight(character: ICharacter): Promise<number> {
    const result = await this.characterWeightCalculator.getTotalCharacterCalculatedWeight(character);

    return result;
  }

  @TrackNewRelicTransaction()
  public async getWeightRatio(character: ICharacter, item: IItem): Promise<number> {
    const weight = await this.getWeight(character);
    const maxWeight = await this.getMaxWeight(character);

    return (weight + item.weight) / maxWeight;
  }
}
