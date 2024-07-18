import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { provide } from "inversify-binding-decorators";

@provide(ResultsPoller)
export class ResultsPoller {
  constructor(private inMemoryHashTable: InMemoryHashTable) {}

  public async prepareResultToBePolled(namespace: string, key: string, result: any): Promise<void> {
    await this.inMemoryHashTable.set(namespace, key, result);
  }

  public async pollResults(namespace: string, key: string): Promise<boolean> {
    const checkInterval = 100; // Interval in milliseconds to check for result
    const maxRetries = 5; // Maximum number of retries before giving up

    for (let i = 0; i < maxRetries; i++) {
      const result = (await this.inMemoryHashTable.get(namespace, key)) as boolean | undefined;
      if (result !== undefined) {
        await this.inMemoryHashTable.delete(namespace, key);
        return result;
      }
      await new Promise((resolve) => setTimeout(resolve, checkInterval));
    }

    return false;
  }
}
