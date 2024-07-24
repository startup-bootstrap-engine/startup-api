import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { provide } from "inversify-binding-decorators";

@provide(ResultsPoller)
export class ResultsPoller {
  constructor(private inMemoryHashTable: InMemoryHashTable) {}

  public async prepareResultToBePolled(namespace: string, key: string, result: any): Promise<void> {
    await this.inMemoryHashTable.set(namespace, key, result);
  }

  @TrackNewRelicTransaction()
  public async pollResults(namespace: string, key: string): Promise<any> {
    let checkInterval = 1;
    const maxRetries = 12;

    for (let i = 0; i < maxRetries; i++) {
      const result = (await this.inMemoryHashTable.get(namespace, key)) as boolean | undefined;
      if (result !== undefined) {
        await this.inMemoryHashTable.delete(namespace, key);
        return result;
      }
      await new Promise((resolve) => setTimeout(resolve, checkInterval));
      checkInterval *= 2;
    }

    await this.inMemoryHashTable.delete(namespace, key); // cleanup if nothing is found

    console.error(`Failed to poll results for ${namespace}:${key} - ms: ${checkInterval}`);
    return false;
  }
}
