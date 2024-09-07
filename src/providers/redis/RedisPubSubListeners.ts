import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { provide } from "inversify-binding-decorators";

@provide(RedisPubSubListeners)
export class RedisPubSubListeners {
  constructor(private socketMessaging: SocketMessaging) {}

  public async addSubscribers(): Promise<void> {
    await this.socketMessaging.subscribeToSocketEvents();
  }
}
