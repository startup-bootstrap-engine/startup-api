import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { provide } from "inversify-binding-decorators";
import { ChatNetworkFindCharacter } from "./ChatNetworkFindCharacter";
import { ChatNetworkGlobalMessaging } from "./ChatNetworkGlobalMessaging";
import { ChatNetworkPrivateMessaging } from "./ChatNetworkPrivateMessaging";
import { ChatNetworkTradeMessaging } from "./ChatNetworkTradeMessaging";

@provide(ChatNetwork)
export class ChatNetwork {
  constructor(
    private chatNetworkGlobalMessaging: ChatNetworkGlobalMessaging,
    private chatNetworkPrivateMessaging: ChatNetworkPrivateMessaging,
    private chatNetworkFindCharacter: ChatNetworkFindCharacter,
    private chatNetworkTradeMessaging: ChatNetworkTradeMessaging
  ) {}

  public onAddEventListeners(channel: SocketChannel): void {
    this.chatNetworkGlobalMessaging.onGlobalMessaging(channel);
    this.chatNetworkPrivateMessaging.onPrivateMessaging(channel);
    this.chatNetworkFindCharacter.onFindCharacter(channel);
    this.chatNetworkTradeMessaging.onTradeMessagingCreate(channel);
    this.chatNetworkTradeMessaging.onTradeMessagingRead(channel);
  }
}
