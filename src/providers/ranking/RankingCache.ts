import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { provide } from "inversify-binding-decorators";

export type RankingCacheType = "global" | "class" | "skill";

@provide(RankingCache)
export class RankingCache {
  constructor(private inMemoryHashTable: InMemoryHashTable) {}

  public async setTopLevelBy<T>(type: RankingCacheType, data: T): Promise<void> {
    await this.inMemoryHashTable.set("rankings", type, data);
  }

  public async getTopLevelBy<T>(type: RankingCacheType): Promise<T> {
    return (await this.inMemoryHashTable.get("rankings", type)) as T;
  }

  public async clearCache(): Promise<void> {
    await this.inMemoryHashTable.deleteAll("rankings");
  }
}
