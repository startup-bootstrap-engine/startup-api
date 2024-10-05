import { IUser } from "@entities/ModuleSystem/schemas/userSchema";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { CharacterSocketEvents, ICharacterPing } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(SocketExampleNetworkPing)
export class SocketExampleNetworkPing {
  constructor(
    private socketAuth: SocketAuth,
    private socketMessaging: SocketMessaging,
    private userRepository: UserRepository
  ) {}

  public onPingListener(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      CharacterSocketEvents.CharacterPing,
      async (data: ICharacterPing, user: IUser) => {
        this.socketMessaging.sendEventToUser(user.channelId!, CharacterSocketEvents.CharacterPing, data);

        await this.userRepository.updateById(user._id, {
          updatedAt: new Date(),
        });
      }
    );
  }
}
