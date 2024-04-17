import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { provide } from "inversify-binding-decorators";
import { ChatNetworkGlobalMessagingQueue } from "./ChatNetworkGlobalMessagingQueue";
import { ChatNetworkPrivateMessaging } from "./ChatNetworkPrivateMessaging";
import { ChatNetworkTradeMessaging } from "./ChatNetworkTradeMessaging";

@provide(ChatNetwork)
export class ChatNetwork {
  constructor(
    private chatNetworkGlobalMessaging: ChatNetworkGlobalMessagingQueue,
    private chatNetworkPrivateMessaging: ChatNetworkPrivateMessaging,
    private chatNetworkTradeMessaging: ChatNetworkTradeMessaging
  ) {}

  public onAddEventListeners(channel: SocketChannel): void {
    this.chatNetworkGlobalMessaging.onGlobalMessaging(channel);
    this.chatNetworkPrivateMessaging.onPrivateMessaging(channel);
    this.chatNetworkTradeMessaging.onTradeMessagingCreate(channel);
    this.chatNetworkTradeMessaging.onTradeMessagingRead(channel);
  }
}
