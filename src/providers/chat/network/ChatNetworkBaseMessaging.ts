import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { ChatSocketEvents } from "@rpg-engine/shared";
import { ChatUtils } from "./ChatUtils";

@provideSingleton(ChatNetworkBaseMessaging)
export class ChatNetworkBaseMessaging {
  constructor(
    private socketAuth: SocketAuth,
    private socketMessaging: SocketMessaging,
    private characterValidation: CharacterValidation,
    private chatUtils: ChatUtils
  ) {}

  public registerCreateEvent(
    channel: SocketChannel,
    event: ChatSocketEvents,
    handleSpecificCreate: (data: any, character: ICharacter) => Promise<void>
  ): void {
    this.socketAuth.authCharacterOn(channel, event, async (data, character) => {
      const canChat = this.characterValidation.hasBasicValidation(character);
      if (!canChat) return;

      if (data.message.length >= 200) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Chat message is too long, maximum is 200 characters"
        );
        return;
      }

      if (data.message.startsWith("/")) {
        await this.chatUtils.handleAdminCommand(data.message.substring(1), character);
        return;
      }

      data = this.chatUtils.replaceProfanity(data);
      await handleSpecificCreate(data, character);
    });
  }

  public registerReadEvent(
    channel: SocketChannel,
    event: ChatSocketEvents,
    handleSpecificRead: (data: any, character: ICharacter) => Promise<void>
  ): void {
    this.socketAuth.authCharacterOn(channel, event, async (data, character) => {
      const canChat = this.characterValidation.hasBasicValidation(character);
      if (!canChat) return;

      await handleSpecificRead(data, character);
    });
  }
}
