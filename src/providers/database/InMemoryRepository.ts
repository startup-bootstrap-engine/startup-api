import { appEnv } from "@providers/config/env";
import { RedisManager } from "@providers/database/RedisManager";
import { IResource } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { Redis } from "ioredis";

export type RedisRecord<T> = Record<string, T>;

export type RedisResource<T> = T & IResource;

@provide(InMemoryRepository)
export class InMemoryRepository {
  private connection: Redis;

  constructor(private redisManager: RedisManager) {}

  public async init(): Promise<void> {
    if (appEnv.general.IS_UNIT_TEST) {
      this.connection = this.redisManager.client!; // we use this to keep it simple during unit tests. Otherwise we'd need to mock the pool factory and etc.
      return;
    }

    this.connection = await this.redisManager.getPoolClient("in-memory-repository");
  }

  public async create<T>(namespace: string, resource: RedisResource<T>): Promise<T> {
    if (!resource._id) {
      throw new Error("Resource does not have an id");
    }

    await this.connection?.set(`${namespace}:${resource._id}`, JSON.stringify(resource));

    const savedResource = await this.read<T>(namespace, resource._id);

    if (!savedResource) {
      throw new Error("Resource was not saved");
    }

    return savedResource;
  }

  public async read<T>(namespace: string, resourceId: string): Promise<T | undefined> {
    const resource = await this.connection?.get(`${namespace}:${resourceId}`);

    if (!resource) {
      return;
    }

    return JSON.parse(resource);
  }

  public async findAndUpdate<T>(namespace: string, resourceId: string, update: Partial<T>): Promise<T> {
    const resource = await this.read<T>(namespace, resourceId);

    const resourceToUpdate = {
      ...resource,
      ...update,
    } as unknown as RedisResource<T>;

    const updated = await this.update<T>(namespace, resourceToUpdate);

    return updated;
  }

  public async update<T>(namespace: string, resource: RedisResource<T>): Promise<T> {
    await this.connection?.set(`${namespace}:${resource._id}`, JSON.stringify(resource));

    const updatedResource = await this.read<T>(namespace, resource._id as string);

    if (!updatedResource) {
      throw new Error("Resource was not updated");
    }

    return updatedResource;
  }

  public async delete(namespace: string, resourceId: string): Promise<boolean> {
    try {
      const exists = await this.read(namespace, resourceId);

      if (!exists) {
        return false;
      }

      await this.connection?.del(`${namespace}:${resourceId}`);

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
