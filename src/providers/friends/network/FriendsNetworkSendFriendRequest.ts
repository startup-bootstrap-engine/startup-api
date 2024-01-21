import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { FriendsSocketEvents, IFriendActionCreatePayload, ISendFriendRequestReadPayload } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

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
