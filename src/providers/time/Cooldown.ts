import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { provide } from "inversify-binding-decorators";

@provide(Cooldown)
export class Cooldown {
  constructor(private inMemoryHashTable: InMemoryHashTable) {}

  public async setCooldown(key: string, seconds: number): Promise<void> {
    await this.inMemoryHashTable.set("time-cooldown", key, Date.now() + seconds * 1000);
  }

  public async getCooldown(key: string): Promise<number | undefined> {
    const cooldown = (await this.inMemoryHashTable.get("time-cooldown", key)) as number | undefined;
    if (!cooldown) {
      return;
    }

    return Math.max(0, cooldown - Date.now());
  }

  public async isOnCooldown(key: string): Promise<boolean> {
    const cooldown = await this.getCooldown(key);
    return !!cooldown;
  }

  public async clearAll(): Promise<void> {
    await this.inMemoryHashTable.deleteAll("time-cooldown");
  }
}
