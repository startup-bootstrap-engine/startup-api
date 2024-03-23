import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { socketEventsBinderControl } from "@providers/inversify/container";
import { SocketSessionControl } from "@providers/sockets/SocketSessionControl";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { provide } from "inversify-binding-decorators";

@provide(CharacterCreateSocketHandler)
export class CharacterCreateSocketHandler {
  constructor(private newRelic: NewRelic, private socketSessionControl: SocketSessionControl) {}

  public async manageSocketConnections(channel: SocketChannel, character: ICharacter): Promise<void> {
    const channelId = channel.id?.toString()!;

    const hasSocketConnection = await this.socketSessionControl.hasSession(character._id);

    if (!hasSocketConnection) {
      await channel.join(channelId);
      await this.socketSessionControl.setSession(character._id);

      channel.on("disconnect", async (reason: string) => {
        await this.socketSessionControl.deleteSession(character._id);
        // @ts-ignore
        channel.removeAllListeners?.(); // make sure we leave no left overs
        await socketEventsBinderControl.unbindEvents(channel);

        // make sure isOnline is turned off

        await Character.updateOne(
          {
            _id: character._id,
          },
          {
            isOnline: false,
            channelId: undefined,
          }
        );

        console.log(`Client disconnected: ${channel.id}, Reason: ${reason}`);

        /*
        transport close: This occurs when the client explicitly closes the connection, such as when a user closes their browser tab or the client application terminates the connection.

        ping timeout: Socket.IO uses heartbeats to ensure the connection is alive. If the server doesn't receive any heartbeat from the client within a certain period, it will close the connection due to a timeout.

        transport error: This indicates a problem with the transport layer, such as network issues or WebSockets being blocked or failing.

        io server disconnect: This is emitted when the server programmatically disconnects the socket using socket.disconnect().

        io client disconnect: This is emitted when the client programmatically disconnects the socket using socket.disconnect().

        client namespace disconnect: Emitted when the client disconnects from a namespace explicitly by calling disconnect() on the namespace.
        */

        // Log the disconnection reason with NewRelic or any other monitoring tool you're using
        this.newRelic.trackMetric(
          NewRelicMetricCategory.Count,
          NewRelicSubCategory.Server,
          `SocketIODisconnect/${reason}`,
          1
        );
      });
    }
  }
}
