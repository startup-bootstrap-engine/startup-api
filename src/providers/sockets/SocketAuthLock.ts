import { Locker } from "@providers/locks/Locker";
import { provide } from "inversify-binding-decorators";

@provide(SocketAuthLock)
export class SocketAuthLock {
  constructor(private locker: Locker) {}

  public async acquireGlobalLock(lockName: string): Promise<boolean> {
    return await this.locker.lock(lockName);
  }

  public async releaseGlobalLock(lockName: string): Promise<void> {
    await this.locker.unlock(lockName);
  }

  public async performLockedEvent(
    characterId: string,
    characterName: string,
    event: string,
    callback: () => Promise<void>
  ): Promise<void> {
    try {
      const hasLocked = await this.acquireGlobalLock(`event-${event}-${characterId}`);
      if (!hasLocked) {
        console.log(`⚠️ ${characterId} - (${characterName}) tried to perform '${event}' but it was locked!`);
        return;
      }
      await callback();
    } catch (error) {
      console.error(error);
    } finally {
      await this.releaseGlobalLock(`event-${event}-${characterId}`);
    }
  }
}
