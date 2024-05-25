import { DYNAMIC_XP_RATIO_BASE_RATIO } from "@providers/constants/DynamicXpRatioConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { provideSingleton } from "@providers/inversify/provideSingleton";

@provideSingleton(DynamicXPRatio)
export class DynamicXPRatio {
  private readonly namespace = "dynamic-xp-ratio";
  private readonly key = "current-ratio";

  constructor(private inMemoryHashTable: InMemoryHashTable) {}

  public async updateXpRatio(newRatio: number): Promise<void> {
    await this.inMemoryHashTable.set(this.namespace, this.key, newRatio);
  }

  public async getXpRatio(): Promise<number> {
    const value = await this.inMemoryHashTable.get(this.namespace, this.key);
    return value !== undefined ? (value as unknown as number) : DYNAMIC_XP_RATIO_BASE_RATIO;
  }
}
