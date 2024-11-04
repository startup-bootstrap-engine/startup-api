import { appEnv } from "@providers/config/env";
import { socketEventsBinderControl } from "@providers/inversify/container";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { ISocket, SocketTypes } from "@startup-engine/shared";
import { GeckosIO } from "./GeckosIO";
import { SocketIO } from "./SocketIO";
import { SocketSessionControl } from "./SocketSessionControl";
import { SocketClasses } from "./SocketsTypes";

@provideSingleton(SocketAdapter)
export class SocketAdapter implements ISocket {
  public static socketClass: SocketClasses;

  constructor(
    private socketIO: SocketIO,
    private geckosIO: GeckosIO,
    private socketSessionControl: SocketSessionControl,
    private userRepository: UserRepository
  ) {}

  public async init(socketType: SocketTypes): Promise<void> {
    switch (socketType as SocketTypes) {
      case SocketTypes.UDP:
        console.log("🔌 Initializing UDP socket...");
        await this.geckosIO.init();
        SocketAdapter.socketClass = this.geckosIO;
        break;
      case SocketTypes.TCP:
      default:
        console.log("🔌 Initializing TCP socket...");
        await this.socketIO.init();
        SocketAdapter.socketClass = this.socketIO;
        break;
    }

    this.onConnect();
  }

  public emitToUser<T>(channel: string, eventName: string, data?: T): void {
    try {
      if (appEnv.general.DEBUG_MODE && !appEnv.general.IS_UNIT_TEST) {
        console.info("⬆️ (SENDING): ", channel, eventName, JSON.stringify(data));
      }

      if (!channel) {
        return;
      }

      if (data) {
        data = this.dataIdToString(data);
      }

      SocketAdapter.socketClass?.emitToUser(channel, eventName, data);
    } catch (error) {
      console.error("Error in emitToUser:", error, { channel, eventName });
    }
  }

  public emitToAllUsers<T>(eventName: string, eventData?: T): void {
    try {
      if (eventData) {
        eventData = this.dataIdToString(eventData || {}) as T;
      }

      SocketAdapter.socketClass?.emitToAllUsers(eventName, eventData);
    } catch (error) {
      console.error("Error in emitToAllUsers:", error, { eventName });
    }
  }

  public onConnect(): void {
    SocketAdapter.socketClass?.onConnect(async (channel) => {
      try {
        const socketQuery = channel?.handshake?.query;

        if (!socketQuery) {
          console.warn("Socket connection attempt without query parameters");
          return;
        }

        const hasCharacterId = socketQuery.characterId !== "undefined" && socketQuery.characterId !== undefined;

        if (hasCharacterId) {
          await this.handleExistingCharacterSession(socketQuery.characterId as string);
        }

        await this.updateCharacterConnection(socketQuery.characterId as string, channel);

        // Set up disconnect handler
        channel.on("disconnect", async () => {
          try {
            if (hasCharacterId) {
              await this.handleDisconnect(socketQuery.characterId as string);
            }
          } catch (error) {
            console.error("Error handling disconnect:", error);
          }
        });
      } catch (error) {
        console.error("Error in socket connection handler:", error);
        try {
          channel.disconnect(true);
        } catch (disconnectError) {
          console.error("Error disconnecting socket:", disconnectError);
        }
      }
    });
  }

  private async handleExistingCharacterSession(characterId: string): Promise<void> {
    const hasSocketOngoingSession = await this.socketSessionControl.hasSession(characterId);

    if (hasSocketOngoingSession) {
      const previousUser = await this.userRepository.findById(characterId, {
        select: "channel",
      });

      if (!previousUser) {
        throw new Error("Character not found!");
      }

      await this.disconnectPreviousSession(previousUser.channel!, characterId);
    }
  }

  private async disconnectPreviousSession(previousChannelId: string, characterId: string): Promise<void> {
    //! Event needs to be implemented on shared and client
    void this.emitToUser(previousChannelId, "ForceDisconnect", {
      reason: "You have been disconnected because you logged in from another device!",
    });

    const previousChannel = this.getChannelById(previousChannelId);

    if (previousChannel) {
      try {
        await previousChannel.leave();
        previousChannel.removeAllListeners();
        await socketEventsBinderControl.unbindEvents(previousChannel);
        await this.socketSessionControl.deleteSession(characterId);
      } catch (error) {
        console.error("Error disconnecting previous session:", error);
      }
    }
  }

  private async updateCharacterConnection(characterId: string, channel: any): Promise<void> {
    const updatedUser = await this.userRepository.updateBy(
      {
        _id: characterId,
      },
      {
        channel: channel.id,
      }
    );

    if (!updatedUser) {
      throw new Error("Character not found!");
    }

    // Set the new session
    await this.socketSessionControl.setSession(characterId);

    console.log(
      `🔌⚡️ Client connected - ${updatedUser.name} (channel: ${updatedUser.channel} / id: ${updatedUser?.id})`
    );

    await socketEventsBinderControl.bindEvents(channel);
  }

  private async handleDisconnect(characterId: string): Promise<void> {
    try {
      await this.userRepository.updateBy(
        {
          _id: characterId,
        },
        {
          channel: "",
        }
      );
      await this.socketSessionControl.deleteSession(characterId);
      console.log(`🔌 Client disconnected - Character ID: ${characterId}`);
    } catch (error) {
      console.error("Error updating character status on disconnect:", error);
    }
  }

  public getChannelById(channelId: string): any {
    try {
      return SocketAdapter.socketClass?.getChannelById(channelId);
    } catch (error) {
      console.error("Error getting channel by ID:", error, { channelId });
      return undefined;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await SocketAdapter.socketClass?.disconnect();
    } catch (error) {
      console.error("Error during adapter disconnect:", error);
    }
  }

  private dataIdToString<T>(data: any): T {
    return JSON.parse(JSON.stringify(data));
  }
}
