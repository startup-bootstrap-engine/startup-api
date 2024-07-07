/* eslint-disable mongoose-lean/require-lean */
import { Character, ICharacter as DBICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { FriendsSocketEvents, ICharacter, IFriendsNetworkRemoveFriendPayload } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(FriendsNetworkRemoveFriend)
export class FriendsNetworkRemoveFriend {
  constructor(
    private characterValidation: CharacterValidation,
    private socketAuth: SocketAuth,
    private socketMessaging: SocketMessaging
  ) {}

  @TrackNewRelicTransaction()
  public onRemoveFriend(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(channel, FriendsSocketEvents.RemoveFriend, async (data, me) => {
      await this.removeFriend(data.characterId, me);
    });
  }

  private async removeFriend(
    characterId: string,
    me: DBICharacter
  ): Promise<IFriendsNetworkRemoveFriendPayload | undefined> {
    const characterValid = this.characterValidation.hasBasicValidation(me);
    if (!characterValid) {
      return;
    }

    const myCharacter = await Character.findById(me._id);
    const character = await Character.findById(characterId);
    if (!character || !myCharacter) {
      return;
    }

    const friendIndex = myCharacter.friends?.indexOf(characterId);
    const characterFriendIndex = character.friends?.indexOf(myCharacter._id);
    if (
      friendIndex !== undefined &&
      friendIndex !== -1 &&
      characterFriendIndex !== undefined &&
      characterFriendIndex !== -1
    ) {
      myCharacter.friends?.splice(friendIndex, 1);
      character.friends?.splice(characterFriendIndex, 1);
    }

    await Promise.all([myCharacter.save(), character.save()]);

    const myFriends = (await Character.find({ _id: { $in: myCharacter.friends } })) as unknown as ICharacter[];
    this.socketMessaging.sendEventToUser<IFriendsNetworkRemoveFriendPayload>(
      myCharacter.channelId!,
      FriendsSocketEvents.RemoveFriend,
      { friends: myFriends }
    );

    const characterFriends = (await Character.find({ _id: { $in: character.friends } })) as unknown as ICharacter[];

    this.socketMessaging.sendEventToUser<IFriendsNetworkRemoveFriendPayload>(
      character.channelId!,
      FriendsSocketEvents.RemoveFriend,
      { friends: characterFriends }
    );
  }
}
