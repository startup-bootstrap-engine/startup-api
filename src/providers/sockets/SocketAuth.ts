/* eslint-disable mongoose-lean/require-lean */
/* eslint-disable require-await */
import { IUser } from "@entities/ModuleSystem/UserModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { provideSingleton } from "@providers/inversify/provideSingleton";
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

    channel.on(event, async (data: any) => {
      try {
        if (!(await this.socketAuthLock.acquireGlobalLock(`global-lock-event-${event}-${channel.id}`))) return;

        // await this.socketAuthEventsValidator.handleEventLogic(event, data, callback, owner);
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
