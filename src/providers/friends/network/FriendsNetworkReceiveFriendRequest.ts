/* eslint-disable mongoose-lean/require-lean */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import type { SocketChannel } from "@providers/sockets/SocketsTypes";
import { FriendsSocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(FriendsNetworkReceiveFriendRequest)
export class FriendsNetworkReceiveFriendRequest {
  constructor(private socketAuth: SocketAuth, private socketMessaging: SocketMessaging) {}

  @TrackNewRelicTransaction()
  public onReceiveFriendRequest(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(channel, FriendsSocketEvents.ReceiveFriendRequest, async (data, me) => {
      await this.receiveFriendRequest(data.characterId, me);
    });
  }

  private async receiveFriendRequest(characterId: string, me: ICharacter): Promise<void> {
    const myCharacter = await Character.findById(me._id);
    const character = await Character.findById(characterId);
    if (!character || !myCharacter) {
      return;
    }

    const friendRequestIds = myCharacter.friendRequests || [];
    const friendRequests = await Character.find({ _id: { $in: friendRequestIds } });

    this.socketMessaging.sendEventToUser<ICharacter[]>(
      myCharacter.channelId!,
      FriendsSocketEvents.ReceiveFriendRequest,
      friendRequests
    );
  }
}
