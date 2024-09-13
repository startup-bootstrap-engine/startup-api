import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { GuildChatLog } from "@entities/ModuleSystem/GuildChatLogModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { GuildCommon } from "@providers/guild/GuildCommon";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import {
  ChatMessageStatus,
  ChatMessageType,
  ChatSocketEvents,
  IChatMessage,
  IChatMessageCreatePayload,
  IUIShowMessage,
  UISocketEvents,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { ObjectId } from "mongoose";
import { ChatUtils } from "./ChatUtils";

const MAX_MESSAGE_LENGTH = 200;
const DEFAULT_MESSAGE_LIMIT = 20;

interface IGuildChatMessageData {
  message: string;
  limit?: number;
}

@provide(ChatNetworkGuildMessaging)
export class ChatNetworkGuildMessaging {
  constructor(
    private socketAuth: SocketAuth,
    private socketMessaging: SocketMessaging,
    private guildCommon: GuildCommon,
    private chatUtils: ChatUtils
  ) {}

  public onGuildMessaging(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      ChatSocketEvents.GuildChatMessageCreate,
      this.handleGuildChatMessageCreate.bind(this)
    );
    this.socketAuth.authCharacterOn(
      channel,
      ChatSocketEvents.GuildChatMessageRead,
      this.handleGuildChatMessageRead.bind(this)
    );
  }

  private async handleGuildChatMessageCreate(data: IChatMessageCreatePayload, character: ICharacter): Promise<void> {
    if (data.message.length >= MAX_MESSAGE_LENGTH) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        `Chat message is too long, maximum is ${MAX_MESSAGE_LENGTH} characters`
      );
      return;
    }

    const characterGuild = await this.guildCommon.getCharactersGuild(character);

    if (!characterGuild) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "You are not in a guild");
      return;
    }

    const cleanedMessage = this.chatUtils.replaceProfanity(data.message as any);

    const otherMemberIds = characterGuild.members
      .filter((memberId) => memberId.toString() !== character._id.toString())
      .map((memberId) => memberId.toString());

    // Log the message
    await GuildChatLog.create({
      message: cleanedMessage,
      emitter: character._id,
      senderName: character.name,
      guild: characterGuild._id,
      status: ChatMessageStatus.Seen,
    });

    // Fetch and format logs (using the helper method)
    const formattedLogs = await this.getFormattedGuildChatLogs(characterGuild._id, data.limit);

    // Send messages to other guild members
    await this.sendMessagesToCharacters(cleanedMessage, otherMemberIds, character.name, formattedLogs);
    this.chatUtils.sendMessagesToCharacter(formattedLogs, character, ChatSocketEvents.GuildChatMessageRead);
  }

  private async handleGuildChatMessageRead(data: IGuildChatMessageData, character: ICharacter): Promise<void> {
    const characterGuild = await this.guildCommon.getCharactersGuild(character);

    if (!characterGuild) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "You are not in a guild");
      return;
    }

    const formattedLogs = await this.getFormattedGuildChatLogs(characterGuild._id, data.limit);

    this.socketMessaging.sendEventToUser<IChatMessage[]>(
      character.channelId!,
      ChatSocketEvents.GuildChatMessageRead,
      formattedLogs
    );
  }

  private async getFormattedGuildChatLogs(
    guildId: ObjectId,
    limit: number = DEFAULT_MESSAGE_LIMIT
  ): Promise<IChatMessage[]> {
    const guildChatLogs = await GuildChatLog.find({ guild: guildId }).sort({ createdAt: -1 }).limit(limit).lean();

    return guildChatLogs.reverse().map((log) => ({
      _id: log._id.toString(),
      message: log.message,
      emitter: {
        _id: (log.emitter as ObjectId).toString(),
        name: log.senderName ?? "Unknown",
      },
      type: ChatMessageType.Guild,
      createdAt: log.createdAt,
    }));
  }

  @TrackNewRelicTransaction()
  private async sendMessagesToCharacters(
    message: string,
    characterIds: string[],
    senderName: string,
    guildChatLogs: IChatMessage[]
  ): Promise<void> {
    const characters = await Character.find({ _id: { $in: characterIds } }).lean();

    for (const character of characters) {
      const isValidCharacterTarget = this.chatUtils.shouldCharacterReceiveMessage(character as ICharacter);

      if (isValidCharacterTarget) {
        const messageToSend = `${senderName}: ${message}`;
        this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
          message: messageToSend,
          type: "info",
        });

        this.chatUtils.sendMessagesToCharacter(
          guildChatLogs,
          character as ICharacter,
          ChatSocketEvents.GuildChatMessageRead
        );
      }
    }
  }
}
