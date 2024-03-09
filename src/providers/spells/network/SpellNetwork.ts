import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { provide } from "inversify-binding-decorators";
import { SpellNetworkCastQueue } from "./SpellNetworkCastQueue";
import { SpellNetworkCooldowns } from "./SpellNetworkCooldowns";
import { SpellNetworkDetails } from "./SpellNetworkDetails";
import { SpellNetworkLearned } from "./SpellNetworkLearned";
import { SpellNetworkReadInfo } from "./SpellNetworkReadInfo";

@provide(SpellNetwork)
export class SpellNetwork {
  constructor(
    private spellNetworkReadInfo: SpellNetworkReadInfo,
    private spellNetworkCast: SpellNetworkCastQueue,
    private spellNetworkDetails: SpellNetworkDetails,
    private spellNetworkLearned: SpellNetworkLearned,
    private spellNetworkCooldowns: SpellNetworkCooldowns
  ) {}

  public onAddEventListeners(channel: SocketChannel): void {
    this.spellNetworkReadInfo.onGetInfo(channel);
    this.spellNetworkCast.onSpellCast(channel);
    this.spellNetworkDetails.onGetDetails(channel);
    this.spellNetworkLearned.onGetDetails(channel);
    this.spellNetworkCooldowns.onSpellCooldownsRead(channel);
  }
}
