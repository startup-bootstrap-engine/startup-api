/* eslint-disable mongoose-lean/require-lean */
import { Character, ICharacter as DBICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { FriendsSocketEvents, ICharacter, IFriendsNetworkAcceptFriendRequestPayload } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

/**
 * Since on sending request checks the mismatches
 * - at this point the request is valid
 * - so it removes the request from my friend requests
 * - and adds ids to each other friends
 */
@provide(FriendsNetworkAcceptFriendRequest)
export class FriendsNetworkAcceptFriendRequest {
  constructor(
    private characterValidation: CharacterValidation,
    private socketAuth: SocketAuth,
    private socketMessaging: SocketMessaging
  ) {}

  @TrackNewRelicTransaction()
  public onAcceptFriendRequest(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(channel, FriendsSocketEvents.AcceptFriendRequest, async (data, me) => {
      await this.acceptFriendRequest(data.characterId, me);
    });
  }

  private async acceptFriendRequest(characterId: string, me: DBICharacter): Promise<ICharacter[] | undefined> {
    const characterValid = this.characterValidation.hasBasicValidation(me);
    if (!characterValid) {
      return;
    }

    const character = await Character.findById(characterId);
    const myCharacter = await Character.findById(me._id);
    if (!character || !myCharacter) {
      return;
    }

    // adding friend to both character
    myCharacter.friends?.push(characterId);
    character.friends?.push(myCharacter._id);

    // removing friend request from my character
    const friendRequestIndex = myCharacter.friendRequests?.indexOf(characterId);
    if (friendRequestIndex !== undefined && friendRequestIndex !== -1) {
      myCharacter.friendRequests?.splice(friendRequestIndex, 1);
    }
    await Promise.all([myCharacter.save(), character.save()]);

    const myFriends = (await Character.find({ _id: { $in: myCharacter.friends } })) as unknown as ICharacter[];
    const characterFriends = (await Character.find({ _id: { $in: character.friends } })) as unknown as ICharacter[];

    const characterFriendRequests = (await Character.find({
      _id: { $in: character.friendRequests },
    })) as unknown as ICharacter[];
    const myCharacterFriendRequests = (await Character.find({
      _id: { $in: myCharacter.friendRequests },
    })) as unknown as ICharacter[];

    this.socketMessaging.sendEventToUser<IFriendsNetworkAcceptFriendRequestPayload>(
      me.channelId!,
      FriendsSocketEvents.AcceptFriendRequest,
      {
        friends: myFriends,
        friendRequests: myCharacterFriendRequests,
      }
    );

    this.socketMessaging.sendEventToUser<IFriendsNetworkAcceptFriendRequestPayload>(
      character.channelId!,
      FriendsSocketEvents.AcceptFriendRequest,
      {
        friends: characterFriends,
        friendRequests: characterFriendRequests,
      }
    );
  }
}
