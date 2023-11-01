import { provide } from "inversify-binding-decorators";
import { RankingGetInfoNetwork } from "./RankingGetInfoNetwork";
import { SocketChannel } from "@providers/sockets/SocketsTypes";

@provide(RankingNetwork)
export class RankingNetwork {
  constructor(private rankingGetInfoNetwork: RankingGetInfoNetwork) {}

  public onAddEventListeners(channel: SocketChannel): void {
    this.rankingGetInfoNetwork.onGetLevelRankings(channel);
    this.rankingGetInfoNetwork.onGetClassRankings(channel);
    this.rankingGetInfoNetwork.onGetSkillRankings(channel);
  }
}
