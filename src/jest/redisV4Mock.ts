/* eslint-disable @typescript-eslint/explicit-function-return-type */
// redis-mock has not been updated for node-redis v4 yet, but the main changes
// in the API are camelCase names and promises instead of callback, so we can work around it.
// https://github.com/yeahoffline/redis-mock/issues/195
import redis from "redis-mock";
// @ts-expect-error Work-around redis-mock types reporting incorrectly as v4 redis.
import { RedisClient } from "@types/redis";
import { promisify } from "util";
const client = redis.createClient() as unknown as RedisClient;
const setEx = promisify(client.setex).bind(client);
const v4Client = {
  connect: () => undefined,
  get: promisify(client.get).bind(client),
  set: promisify(client.set).bind(client),
  del: promisify(client.del).bind(client),
  hSet: promisify(client.hset).bind(client),
  hKeys: promisify(client.hkeys).bind(client),
  hSetNX: promisify(client.hsetnx).bind(client),
  hGet: promisify(client.hget).bind(client),
  hDel: promisify(client.hdel).bind(client),
  hGetAll: promisify(client.hgetall).bind(client),
  exists: promisify(client.exists).bind(client),
  hExists: promisify(client.hexists).bind(client),
  flushAll: promisify(client.flushall).bind(client),
  setEx: promisify(client.setex).bind(client),
  expire: promisify(client.expire).bind(client),
  mGet: promisify(client.mget).bind(client),
  pTTL: promisify(client.pttl).bind(client),
  pSetEx: (key: string, ms: number, value: string) => setEx(key, ms / 1000, value),
  on: () => undefined,
  // Add additional functions as needed...

  // IORedis compatible functions
  hset: promisify(client.hset).bind(client),
  keys: promisify(client.keys).bind(client),
  hkeys: promisify(client.hkeys).bind(client),
  hsetnx: promisify(client.hsetnx).bind(client),
  hget: promisify(client.hget).bind(client),
  hdel: promisify(client.hdel).bind(client),
  hgetall: promisify(client.hgetall).bind(client),

  hexists: promisify(client.hexists).bind(client),
  flushall: promisify(client.flushall).bind(client),
  setex: promisify(client.setex).bind(client),
  mget: promisify(client.mget).bind(client),
  pttl: promisify(client.pttl).bind(client),
  psetex: (key: string, ms: number, value: string) => setEx(key, ms / 1000, value),
};
export default { ...redis, createClient: () => v4Client };
