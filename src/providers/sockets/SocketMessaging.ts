import { appEnv } from "@providers/config/env";
import { RedisStreamChannels, RedisStreams } from "@providers/redis/RedisStreams";
import { SocketAdapter } from "@providers/sockets/SocketAdapter";
import { provide } from "inversify-binding-decorators";

@provide(SocketMessaging)
export class SocketMessaging {
  constructor(private socketAdapter: SocketAdapter, private redisStreams: RedisStreams) {}

  public addSendEventToUserListener(): void {
    // eslint-disable-next-line require-await
    void this.redisStreams.readFromStream(RedisStreamChannels.SocketEvents, async (message) => {
      const { userChannel, eventName, data: eventData } = message;
      this.sendEventToUser(userChannel, eventName, eventData);
    });
  }

  public sendEventToUser<T>(userChannel: string, eventName: string, data?: T): void {
    if (appEnv.general.IS_UNIT_TEST) {
      void this.socketAdapter.emitToUser(userChannel, eventName, data || {});
      return;
    }

    if (appEnv.general.MICROSERVICE_NAME === "rpg-npc") {
      // Add to stream to be processed by the rpg-socket service
      void this.redisStreams.addToStream(RedisStreamChannels.SocketEvents, {
        userChannel,
        eventName,
        data: data || {},
      });
    } else {
      // We're in the rpg-socket service; emit directly to the user
      void this.socketAdapter.emitToUser(userChannel, eventName, data || {});
    }
  }

  //! Careful with the method! This sends an event to ALL USERS ON THE SERVER!
  public sendEventToAllUsers<T>(eventName: string, data?: T): void {
    this.socketAdapter.emitToAllUsers(eventName, data || {});
  }
}
