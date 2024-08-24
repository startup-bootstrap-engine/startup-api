import { InternalRequestMiddleware } from "@providers/middlewares/InternalRequestMiddleware";
import { SocketAdapter } from "@providers/sockets/SocketAdapter";
import { controller, httpPost, interfaces, requestBody } from "inversify-express-utils";

interface IEventRequest<T> {
  userChannel: string;
  eventName: string;
  data?: T;
}

@controller("/sockets", InternalRequestMiddleware)
export class SocketsController implements interfaces.Controller {
  constructor(private socketAdapter: SocketAdapter) {}

  @httpPost("/send-event")
  private sendEventToUser<T>(@requestBody() body: IEventRequest<T>): void {
    const { userChannel, eventName, data } = body;
    // validate
    if (!userChannel || !eventName || !data) {
      return;
    }

    void this.socketAdapter.emitToUser(userChannel, eventName, data || {});
  }

  a;
}
