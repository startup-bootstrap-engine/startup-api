import { appEnv } from "@providers/config/env";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Redis } from "ioredis";
import { RedisManager } from "./RedisManager";

@provideSingleton(InMemoryHashTable)
export class InMemoryHashTable {
  private connection: Redis;

  constructor(private redisManager: RedisManager) {}

  public async init(): Promise<void> {
    this.connection = await this.redisManager.getPoolClient("in-memory-hash-table");
  }

  public async set(namespace: string, key: string, value: any): Promise<void> {
    await this.connection.hset(namespace?.toString(), key?.toString(), JSON.stringify(value));
  }

  public async setNx(namespace: string, key: string, value: any): Promise<boolean> {
    const result = await this.connection.hsetnx(namespace?.toString(), key?.toString(), JSON.stringify(value));
    return result === 1;
  }

  public async expire(key: string, seconds: number, mode: "NX" | "XX" | "GT" | "LT"): Promise<void> {
    if (!appEnv.general.IS_UNIT_TEST) {
      await this.connection.expire(key?.toString(), seconds, mode as any);
    }
  }

  public async getExpire(namespace: string): Promise<number> {
    if (!namespace) {
      throw new Error("Namespace is undefined or null.");
    }

    const timeLeft = (await this.connection.pttl(namespace.toString())) ?? 0;
    return timeLeft;
  }

  public async getAll<T>(namespace: string): Promise<Record<string, T> | undefined> {
    const values = await this.connection.hgetall(namespace?.toString());

    if (!values) {
      return;
    }

    return this.parseObject(values);
  }

  public async has(namespace: string, key: string): Promise<boolean> {
    const result = await this.connection.hexists(namespace?.toString(), key?.toString());
    return Boolean(result);
  }

  public async hasAll(namespace: string): Promise<boolean> {
    const result = await this.connection.exists(namespace?.toString());
    return result === 1;
  }

  public async get(namespace: string, key: string): Promise<Record<string, any> | undefined> {
    const value = await this.connection.hget(namespace?.toString(), key?.toString());

    if (!value) {
      return;
    }

    return JSON.parse(value);
  }

  public async getAllKeysWithPrefix(prefix: string): Promise<string[]> {
    const keys = await this.connection.keys(`${prefix}*`);
    return keys ?? [];
  }

  public async getAllKeys(namespace: string): Promise<string[]> {
    const keys = await this.connection.hkeys(namespace?.toString());
    return keys ?? [];
  }

  public async delete(namespace: string, key: string): Promise<void> {
    await this.connection.hdel(namespace?.toString(), key?.toString());
  }

  public async deleteAll(namespace: string): Promise<void> {
    await this.connection.del(namespace?.toString());
  }

  private parseObject(object: Record<string, string>): Record<string, any> {
    return Object.entries(object).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: JSON.parse(value),
      };
    }, {});
  }
}
