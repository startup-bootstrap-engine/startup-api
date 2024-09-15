import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { provide } from "inversify-binding-decorators";

@provide(Cooldown)
export class Cooldown {
  constructor(private inMemoryHashTable: InMemoryHashTable) {}

  /**
   * Sets a cooldown with a specified key and duration in seconds.
   */
  public async setCooldown(key: string, seconds: number): Promise<void> {
    const expiry = Date.now() + seconds * 1000;
    await this.inMemoryHashTable.set("time-cooldown", key, expiry);
  }

  /**
   * Retrieves the remaining cooldown time in milliseconds.
   */
  public async getRemainingCooldownTime(key: string): Promise<number> {
    const cooldown = (await this.inMemoryHashTable.get("time-cooldown", key)) as number | undefined;
    if (!cooldown) {
      return 0;
    }
    return Math.max(0, cooldown - Date.now());
  }

  /**
   * Checks if a cooldown is active.
   */
  public async isOnCooldown(key: string): Promise<boolean> {
    return (await this.getRemainingCooldownTime(key)) > 0;
  }

  /**
   * Clears a specific cooldown.
   */
  public async clearCooldown(key: string): Promise<void> {
    await this.inMemoryHashTable.delete("time-cooldown", key);
  }

  /**
   * Clears all cooldowns.
   */
  public async clearAll(): Promise<void> {
    await this.inMemoryHashTable.deleteAll("time-cooldown");
  }
}
