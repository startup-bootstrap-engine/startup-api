import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { provide } from "inversify-binding-decorators";
import { CharacterNetworkAutoLoot } from "./CharacterNetworkAutoLoot";
import { CharacterNetworkCreate } from "./CharacterNetworkCreate";
import { CharacterNetworkLogout } from "./CharacterNetworkLogout";
import { CharacterNetworkPing } from "./CharacterNetworkPing";
import { CharacterNetworkSearch } from "./CharacterNetworkSearch";
import { CharacterNetworkTrading } from "./CharacterNetworkTrading";
import { CharacterNetworkUpdateQueue } from "./CharacterNetworkUpdate/CharacterNetworkUpdateQueue";

@provide(CharacterNetwork)
export class CharacterNetwork {
  constructor(
    private characterCreate: CharacterNetworkCreate,
    private characterLogout: CharacterNetworkLogout,
    private characterUpdate: CharacterNetworkUpdateQueue,
    private characterPing: CharacterNetworkPing,
    private characterTrading: CharacterNetworkTrading,
    private characterSearch: CharacterNetworkSearch,
    private characterAutoLoot: CharacterNetworkAutoLoot
  ) {}

  public onAddEventListeners(channel: SocketChannel): void {
    this.characterCreate.onCharacterCreate(channel);
    this.characterLogout.onCharacterLogout(channel);
    this.characterUpdate.onCharacterUpdatePosition(channel);
    this.characterPing.onCharacterPing(channel);
    this.characterTrading.onCharacterNPCTrade(channel);
    this.characterSearch.onFindCharacter(channel);
    this.characterAutoLoot.onCharacterAutoLoot(channel);
  }
}
