import { CharacterNetwork } from "@providers/character/network/CharacterNetwork";
import { NPCNetwork } from "@providers/npc/network/NPCNetwork";
import { provide } from "inversify-binding-decorators";
import { SocketChannel } from "./SocketsTypes";

@provide(SocketEventsBinder)
export class SocketEventsBinder {
  constructor(private characterNetwork: CharacterNetwork, private npcNetwork: NPCNetwork) {}

  public bindEvents(channel: SocketChannel): void {
    this.characterNetwork.onAddEventListeners(channel);
    this.npcNetwork.onAddEventListeners(channel);
  }
}
