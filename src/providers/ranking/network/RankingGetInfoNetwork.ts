import { SocketAuth } from "@providers/sockets/SocketAuth";
import { provide } from "inversify-binding-decorators";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { RankingGetInfo } from "../RankingGetInfo";
import { LeaderboardSocketEvents } from "@rpg-engine/shared";

@provide(RankingGetInfoNetwork)
export class RankingGetInfoNetwork {
  constructor(private socketAuth: SocketAuth, private rankingGetInfo: RankingGetInfo) {}

  public onGetLevelRankings(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(channel, LeaderboardSocketEvents.GetLevelRanking, async (data, character) => {
      await this.rankingGetInfo.getLevelRanking(character);
    });
  }

  public onGetClassRankings(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(channel, LeaderboardSocketEvents.GetClassRanking, async (data, character) => {
      await this.rankingGetInfo.getClassRanking(character);
    });
  }

  public onGetSkillRankings(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(channel, LeaderboardSocketEvents.GetSkillRanking, async (data, character) => {
      await this.rankingGetInfo.getSkillRanking(character);
    });
  }
}
