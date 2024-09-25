import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { provide } from "inversify-binding-decorators";
import { ChatNetworkLocalMessagingQueue } from "./ChatNetworkLocalMessagingQueue";
import { ChatNetworkGlobalMessagingQueue } from "./ChatNetworkGlobalMessaging";
import { ChatNetworkGuildMessaging } from "./ChatNetworkGuildMessaging";
import { ChatNetworkPrivateMessaging } from "./ChatNetworkPrivateMessaging";
import { ChatNetworkTradeMessaging } from "./ChatNetworkTradeMessaging";

@provide(ChatNetwork)
export class ChatNetwork {
  constructor(
    private chatNetworkGlobalMessaging: ChatNetworkGlobalMessagingQueue,
    private chatNetworkLocalMessaging: ChatNetworkLocalMessagingQueue,
    private chatNetworkPrivateMessaging: ChatNetworkPrivateMessaging,
    private chatNetworkTradeMessaging: ChatNetworkTradeMessaging,
    private chatNetworkGuildMessaging: ChatNetworkGuildMessaging
  ) {}

  public onAddEventListeners(channel: SocketChannel): void {
    this.chatNetworkGlobalMessaging.onGlobalMessagingCreate(channel);
    this.chatNetworkGlobalMessaging.onGlobalMessagingRead(channel);
    this.chatNetworkLocalMessaging.onLocalMessaging(channel);
    this.chatNetworkPrivateMessaging.onPrivateMessaging(channel);
    this.chatNetworkTradeMessaging.onTradeMessagingCreate(channel);
    this.chatNetworkTradeMessaging.onTradeMessagingRead(channel);
    this.chatNetworkGuildMessaging.onGuildMessaging(channel);
  }
}
