import { appEnv } from "@providers/config/env";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { provide } from "inversify-binding-decorators";

@provide(RedisStreamsListeners)
export class RedisStreamsListeners {
  constructor(private socketMessaging: SocketMessaging) {}

  public async addSubscribers(): Promise<void> {
    const { MICROSERVICE_NAME } = appEnv.general;

    const IS_MICROSERVICE = !!MICROSERVICE_NAME;

    !IS_MICROSERVICE && (await this.socketMessaging.addSendEventToUserListener());
  }
}
