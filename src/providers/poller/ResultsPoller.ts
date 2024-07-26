import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { provide } from "inversify-binding-decorators";

@provide(ResultsPoller)
export class ResultsPoller {
  private readonly parentNamespace = "results-poller";
  private readonly maxBackoff = 1000; // Maximum backoff time in milliseconds

  constructor(private inMemoryHashTable: InMemoryHashTable) {}

  private getFullKey(namespace: string, key: string): string {
    return `${this.parentNamespace}:${namespace}:${key}`;
  }

  public async prepareResultToBePolled(namespace: string, key: string, result: any): Promise<void> {
    const fullKey = this.getFullKey(namespace, key);
    await this.inMemoryHashTable.set(this.parentNamespace, fullKey, result);
  }

  @TrackNewRelicTransaction()
  public async pollResults(namespace: string, key: string): Promise<any> {
    const maxRetries = 10;
    const fullKey = this.getFullKey(namespace, key);

    try {
      for (let i = 0; i < maxRetries; i++) {
        const result = await this.inMemoryHashTable.get(this.parentNamespace, fullKey);
        if (result !== undefined) {
          return result;
        }
        const backoffTime = Math.min(this.maxBackoff, 2 ** i);
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
      }

      console.error(`Failed to poll results for ${fullKey} after ${maxRetries} retries`);
      return false;
    } finally {
      // Always cleanup, regardless of success or failure
      await this.inMemoryHashTable.delete(this.parentNamespace, fullKey);
    }
  }

  public async clearAll(): Promise<void> {
    await this.inMemoryHashTable.deleteAll(this.parentNamespace);
  }
}
