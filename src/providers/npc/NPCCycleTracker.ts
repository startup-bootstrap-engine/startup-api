import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import dayjs from "dayjs";

@provideSingleton(NPCCycleTracker)
export class NPCCycleTracker {
  private readonly namespace = "npc-cycle-tracker";
  private readonly maxSamples = 1000;

  constructor(private inMemoryHashTable: InMemoryHashTable) {}

  public async trackCycle(npcId: string): Promise<void> {
    const now = dayjs();
    const key = `${npcId}:lastExecution`;
    const lastExecution = await this.inMemoryHashTable.get(this.namespace, key);
    if (lastExecution) {
      const interval = now.diff(dayjs(lastExecution.timestamp));
      await this.updateIntervals(npcId, interval);
    }
    await this.inMemoryHashTable.set(this.namespace, key, { timestamp: now.valueOf() });
  }

  private async updateIntervals(npcId: string, interval: number): Promise<void> {
    const intervalsKey = `${npcId}:intervals`;
    const intervals = (await this.inMemoryHashTable.get(this.namespace, intervalsKey)) || { data: [] };
    intervals.data.push(interval);
    if (intervals.data.length > this.maxSamples) {
      intervals.data.shift();
    }
    await this.inMemoryHashTable.set(this.namespace, intervalsKey, intervals);
  }

  public async getAverageInterval(npcId: string): Promise<number | null> {
    const intervalsKey = `${npcId}:intervals`;
    const intervals = await this.inMemoryHashTable.get(this.namespace, intervalsKey);
    if (!intervals || intervals.data.length === 0) {
      return null;
    }
    const sum = intervals.data.reduce((acc: number, val: number) => acc + val, 0);
    return sum / intervals.data.length;
  }

  public async clearAllData(): Promise<void> {
    await this.inMemoryHashTable.deleteAll(this.namespace);
  }

  public async getOverallAverageCycleTime(): Promise<number> {
    const keys = await this.inMemoryHashTable.getAllKeys(this.namespace);
    const intervalKeys = keys.filter((key) => key.endsWith(":intervals"));
    let totalSum = 0;
    let totalCount = 0;
    for (const key of intervalKeys) {
      const intervals = await this.inMemoryHashTable.get(this.namespace, key);
      if (intervals && intervals.data.length > 0) {
        totalSum += intervals.data.reduce((acc: number, val: number) => acc + val, 0);
        totalCount += intervals.data.length;
      }
    }
    const averageTime = Math.round(totalCount > 0 ? totalSum / totalCount : 0);
    await this.clearAllData(); // Clear all data after calculating the average
    return averageTime;
  }
}
