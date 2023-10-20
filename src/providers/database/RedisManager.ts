/* eslint-disable no-async-promise-executor */
import { appEnv } from "@providers/config/env";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import IORedis from "ioredis";
import { RedisBareClient } from "./RedisManager/RedisBareClient";
import { RedisIOClient } from "./RedisManager/RedisIOClient";
@provideSingleton(RedisManager)
export class RedisManager {
  public client: IORedis.Redis;

  constructor(private redisBareClient: RedisBareClient, private redisIOClient: RedisIOClient) {}

  public async connect(): Promise<void> {
    if (appEnv.general.IS_UNIT_TEST) {
      this.client = await this.redisBareClient.connect();
    } else {
      this.client = await this.redisIOClient.connect();
    }
  }
}
