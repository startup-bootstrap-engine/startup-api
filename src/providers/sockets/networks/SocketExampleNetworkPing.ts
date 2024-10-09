import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { IUser } from "@startup-engine/shared";
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
      // use an enum here
      "CharacterPing",
      async (data: any, user: IUser) => {
        this.socketMessaging.sendEventToUser(user.channelId!, "CharacterPing", data);

        await this.userRepository.updateById(user._id, {
          updatedAt: new Date(),
        });
      }
    );
  }
}
