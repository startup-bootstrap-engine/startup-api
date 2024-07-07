/* eslint-disable mongoose-lean/require-lean */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { FriendsSocketEvents, IFriendActionCreatePayload, ISendFriendRequestReadPayload } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

/**
 * Validates the friend request between characters, ensuring:
 * - character is valid
 * - character is not sending a friend request to himself
 * - character is already friends with the other character
 * - character already sent a friend request to the other character
 * - character already received a friend request from the other character
 * - Adds the friend request to the other character
 */

@provide(FriendsNetworkSendFriendRequest)
export class FriendsNetworkSendFriendRequest {
  constructor(
    private characterValidation: CharacterValidation,
    private socketAuth: SocketAuth,
    private socketMessaging: SocketMessaging
  ) {}

  @TrackNewRelicTransaction()
  public onSendFriendRequest(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      FriendsSocketEvents.SendFriendRequest,
      async (data: IFriendActionCreatePayload, me) => {
        await this.sendFriendRequest(data.characterId, me);
      }
    );
  }

  private async sendFriendRequest(
    characterId: string,
    me: ICharacter
  ): Promise<ISendFriendRequestReadPayload | undefined> {
    const characterValid = this.characterValidation.hasBasicValidation(me);
    if (!characterValid) {
      return;
    }

    if (characterId === me._id) {
      this.socketMessaging.sendEventToUser<ISendFriendRequestReadPayload>(
        me.channelId!,
        FriendsSocketEvents.SendFriendRequest,
        {
          error: "You can't send a friend request to yourself.",
        }
      );
      return;
    }

    const character = await Character.findById(characterId);
    const myCharacter = await Character.findById(me._id);
    if (!character || !myCharacter) {
      return;
    }

    const characterAlreadyFriend = myCharacter.friends?.includes(characterId);
    if (characterAlreadyFriend) {
      this.socketMessaging.sendEventToUser<ISendFriendRequestReadPayload>(
        myCharacter.channelId!,
        FriendsSocketEvents.SendFriendRequest,
        {
          error: "You are already friends with this character.",
        }
      );
      return;
    }

    const characterAlreadyReceivedFriendRequest = character.friendRequests?.includes(myCharacter._id);
    if (characterAlreadyReceivedFriendRequest) {
      this.socketMessaging.sendEventToUser<ISendFriendRequestReadPayload>(
        myCharacter.channelId!,
        FriendsSocketEvents.SendFriendRequest,
        {
          error: "You already sent a friend request to this character.",
        }
      );
      return;
    }

    const characterAlreadySentFriendRequest = myCharacter.friendRequests?.includes(characterId);
    if (characterAlreadySentFriendRequest) {
      this.socketMessaging.sendEventToUser<ISendFriendRequestReadPayload>(
        myCharacter.channelId!,
        FriendsSocketEvents.SendFriendRequest,
        {
          error: "This character already sent a friend request to you.",
        }
      );
      return;
    }

    // adding myId to character friend requests
    character.friendRequests?.push(myCharacter._id);

    await character.save();

    const friendRequests = await Character.find({ _id: { $in: character.friendRequests } });

    this.socketMessaging.sendEventToUser<ICharacter[]>(
      character.channelId!,
      FriendsSocketEvents.ReceiveFriendRequest,
      friendRequests
    );
  }
}
