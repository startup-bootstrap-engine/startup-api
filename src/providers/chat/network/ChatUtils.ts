import { profanity } from "@2toad/profanity";
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import type {
  ILocalChatMessageCreatePayload as IChatMessageCreatePayload,
  IPrivateChatMessageCreatePayload,
  ITradeChatMessageCreatePayload,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { AdminCommands } from "./AdminCommands";

type CommonChatMessagePayload =
  | IChatMessageCreatePayload
  | IPrivateChatMessageCreatePayload
  | ITradeChatMessageCreatePayload;

@provide(ChatUtils)
export class ChatUtils {
  constructor(private adminCommands: AdminCommands, private socketMessaging: SocketMessaging) {}
  public replaceProfanity<T extends CommonChatMessagePayload>(data: T): T {
    if (profanity.exists(data.message)) {
      const words = data.message.split(" ");
      let i = 0;
      for (i = 0; i < words.length; i++) {
        if (profanity.exists(words[i])) {
          words[i] = words[i][0] + words[i].substring(1).replace(/[^\s]/g, "*");
        }
      }
      data.message = words.join(" ");
    }

    return data;
  }

  public async handleAdminCommand(command: string, character: ICharacter): Promise<void> {
    if (!character.isAdmin) {
      return;
    }

    const [cmd, ...params] = command.split(" ");

    switch (cmd) {
      case "ban":
        await this.adminCommands.handleBanCommand(params, character);
        break;
      case "sendtemple":
        await this.adminCommands.handleSendTempleCommand(params, character);
        break;
      case "teleport":
        await this.adminCommands.handleTeleportCommand(params, character);
        break;
      case "goto":
        await this.adminCommands.handleGotoCommand(params, character);
        break;
      case "getpos":
        await this.adminCommands.handleGetPosCommand(params, character);
        break;
      case "summon":
        await this.adminCommands.handleSummonCommand(params, character);
        break;
      case "online":
        await this.adminCommands.handleOnlineCommand(character);
        break;
      default:
        // Invalid command
        break;
    }
  }

  public sendMessagesToCharacter<T>(chatLogs: T, character: ICharacter, eventName: string): void {
    const isValidCharacterTarget = this.shouldCharacterReceiveMessage(character);

    if (isValidCharacterTarget) {
      this.socketMessaging.sendEventToUser<T>(character.channelId!, eventName, chatLogs);
    }
  }

  public shouldCharacterReceiveMessage(target: ICharacter): boolean {
    return target.isOnline && !target.isBanned;
  }
}
