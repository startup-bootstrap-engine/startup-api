/* eslint-disable no-unused-vars */
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { provide } from "inversify-binding-decorators";
import { FriendsNetworkAcceptFriendRequest } from "./FriendsNetworkAcceptFriendRequest";
import { FriendsNetworkReceiveFriendRequest } from "./FriendsNetworkReceiveFriendRequest";
import { FriendsNetworkRemoveFriend } from "./FriendsNetworkRemoveFriend";
import { FriendsNetworkSendFriendRequest } from "./FriendsNetworkSendFriendRequest";

@provide(FriendsNetwork)
export class FriendsNetwork {
  constructor(
    private friendsNetworkSendFriendRequest: FriendsNetworkSendFriendRequest,
    private friendsNetworkAcceptFriendRequest: FriendsNetworkAcceptFriendRequest,
    private FriendsNetworkReceiveFriendRequest: FriendsNetworkReceiveFriendRequest,
    private FriendsNetworkRemoveFriend: FriendsNetworkRemoveFriend
  ) {}

  public onAddEventListeners(channel: SocketChannel): void {
    this.friendsNetworkSendFriendRequest.onSendFriendRequest(channel);
    this.friendsNetworkAcceptFriendRequest.onAcceptFriendRequest(channel);
    this.FriendsNetworkReceiveFriendRequest.onReceiveFriendRequest(channel);
    this.FriendsNetworkRemoveFriend.onRemoveFriend(channel);
  }
}
