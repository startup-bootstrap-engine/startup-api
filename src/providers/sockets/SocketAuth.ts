/* eslint-disable mongoose-performance/require-lean */
/* eslint-disable require-await */
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { IUser } from "@startup-engine/shared";
import { SocketAuthLock } from "./SocketAuthLock";

@provideSingleton(SocketAuth)
export class SocketAuth {
  constructor(private socketAuthLock: SocketAuthLock) {}

  @TrackNewRelicTransaction()
  public authCharacterOn(
    channel,
    event: string,
    callback: (data, owner: IUser) => Promise<any>,
    runBasicCharacterValidation: boolean = true,
    isLeanQuery = true
  ): void {
    this.removeListenerIfExists(channel, event);

    channel.on(event, async (data: any, owner: IUser) => {
      try {
        if (!(await this.socketAuthLock.acquireGlobalLock(`global-lock-event-${event}-${channel.id}`))) return;

        // await this.socketAuthEventsValidator.handleEventLogic(event, data, callback, owner);
        await callback(data, owner);
      } catch (error) {
        console.error(error);
      } finally {
        await this.socketAuthLock.releaseGlobalLock(`global-lock-event-${event}-${channel.id}`);
      }
    });
  }

  private removeListenerIfExists(channel, event: string): void {
    channel.removeAllListeners(event);
  }
}
