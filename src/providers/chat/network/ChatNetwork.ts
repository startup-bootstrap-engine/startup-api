import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { provide } from "inversify-binding-decorators";
import { ChatNetworkGlobalMessaging } from "./ChatNetworkGlobalMessaging";
import { ChatNetworkPrivateMessaging } from "./ChatNetworkPrivateMessaging";
import { ChatNetworkFindCharacter } from "./ChatNetworkFindCharacter";

@provide(ChatNetwork)
export class ChatNetwork {
  constructor(
    private chatNetworkGlobalMessaging: ChatNetworkGlobalMessaging,
    private ChatNetworkPrivateMessaging: ChatNetworkPrivateMessaging,
    private ChatNetworkFindCharacter: ChatNetworkFindCharacter
  ) {}

  public onAddEventListeners(channel: SocketChannel): void {
    this.chatNetworkGlobalMessaging.onGlobalMessaging(channel);
    this.ChatNetworkPrivateMessaging.onPrivateMessaging(channel);
    this.ChatNetworkFindCharacter.onFindCharacter(channel);
  }
}
