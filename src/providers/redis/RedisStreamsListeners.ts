import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { provide } from "inversify-binding-decorators";

@provide(RedisStreamsListeners)
export class RedisStreamsListeners {
  constructor(private socketMessaging: SocketMessaging) {}

  public async addSubscribers(): Promise<void> {
    await this.socketMessaging.subscribeToSocketEvents();
  }
}
