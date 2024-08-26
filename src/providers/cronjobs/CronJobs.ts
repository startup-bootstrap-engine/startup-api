import { appEnv } from "@providers/config/env";
import { PM2Helper } from "@providers/server/PM2Helper";
import { EnvType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { BonusXpEventCrons } from "./BonusXpEventCrons";
import { CharacterCrons } from "./CharacterCrons";
import { ChatLogCrons } from "./ChatLogCrons";
import { CleanupBloodCrons } from "./CleanupBloodCrons";
import { CleanupBodyCrons } from "./CleanupBodyCrons";
import { CleanupEmptyBodyCrons } from "./CleanupEmptyBodies";
import { ControlTimeCrons } from "./ControlTimeCrons";
import { DatabaseMonitorCrons } from "./DatabaseMonitorCrons";
import { DeleteChatCrons } from "./DeleteChatCrons";
import { DiscordCronJobs } from "./DiscordCronJobs";
import { ItemDeleteCrons } from "./ItemDeleteCrons";
import { MacroCaptchaCrons } from "./MacroCaptchaCrons";
import { MarketplaceCrons } from "./MarketplaceCrons";
import { NPCCrons } from "./NPCCrons";

import { CharacterTradingCrons } from "./CharacterTradingCrons";
import { GuildCrons } from "./GuildCrons";
import { PlantCrons } from "./PlantCrons";
import { PremiumAccountCrons } from "./PremiumAccountCrons";
import { QueueCrons } from "./QueueCrons";
import { RankingCrons } from "./RankingCrons";
import { RedisCrons } from "./RedisCrons";
import { ReferralBonusCrons } from "./ReferralBonusCrons";
import { RemoveInactivePartyMembersCron } from "./RemoveInactivePartyMembersCron";
import { ResourceGatheringCrons } from "./ResourceGatheringCrons";
import { TotalAvailableGold } from "./TotalAvailableGold";

@provide(Cronjob)
export class Cronjob {
  constructor(
    private characterCron: CharacterCrons,
    private chatLogCron: ChatLogCrons,
    private npcCron: NPCCrons,
    private controlTimeCron: ControlTimeCrons,
    private pm2Helper: PM2Helper,
    private itemDeleteCrons: ItemDeleteCrons,
    private deleteChatCrons: DeleteChatCrons,
    private cleanupBloodCrons: CleanupBloodCrons,
    private cleanupBodyCrons: CleanupBodyCrons,
    private cleanupEmptyBodyCrons: CleanupEmptyBodyCrons,
    private macroCaptchaCrons: MacroCaptchaCrons,
    private totalAvailableGold: TotalAvailableGold,
    private marketplaceCrons: MarketplaceCrons,
    private rankingCrons: RankingCrons,
    private redisCrons: RedisCrons,
    private databaseMonitorCrons: DatabaseMonitorCrons,
    private removeInactivePartyMembersCron: RemoveInactivePartyMembersCron,
    private discordCronJobs: DiscordCronJobs,
    private resourceGatheringCronJobs: ResourceGatheringCrons,
    private premiumAccountCrons: PremiumAccountCrons,
    private referralBonusCrons: ReferralBonusCrons,
    private plantCrons: PlantCrons,
    private queueCrons: QueueCrons,
    private characterTradingCrons: CharacterTradingCrons,
    private bonusXpEventCrons: BonusXpEventCrons,
    private guildCrons: GuildCrons
  ) {}

  public start(): void {
    this.scheduleCrons();
  }

  private scheduleCrons(): void {
    console.log("🕒 Start cronjob scheduling...");

    switch (appEnv.general.ENV) {
      case EnvType.Development:
        this.characterCron.schedule();
        this.chatLogCron.schedule();
        this.npcCron.schedule();
        this.controlTimeCron.schedule();
        this.itemDeleteCrons.schedule();
        this.deleteChatCrons.schedule();
        this.cleanupBloodCrons.schedule();
        this.cleanupBodyCrons.schedule();
        this.cleanupEmptyBodyCrons.schedule();
        this.macroCaptchaCrons.schedule();
        this.marketplaceCrons.schedule();
        this.totalAvailableGold.schedule();
        this.redisCrons.schedule();
        this.databaseMonitorCrons.schedule();
        this.removeInactivePartyMembersCron.schedule();
        this.discordCronJobs.schedule();
        this.resourceGatheringCronJobs.schedule();
        this.premiumAccountCrons.schedule();
        this.referralBonusCrons.schedule();
        this.plantCrons.schedule();
        this.queueCrons.schedule();
        this.characterTradingCrons.schedule();
        this.bonusXpEventCrons.schedule();
        this.guildCrons.schedule();
        break;
      case EnvType.Staging:
      case EnvType.Production:
        // make sure it only runs in one instance
        if (process.env.pm_id === this.pm2Helper.pickLastCPUInstance()) {
          this.characterCron.schedule();
          this.chatLogCron.schedule();
          this.npcCron.schedule();
          this.controlTimeCron.schedule();
          this.itemDeleteCrons.schedule();
          this.deleteChatCrons.schedule();
          this.cleanupBloodCrons.schedule();
          this.cleanupBodyCrons.schedule();
          this.cleanupEmptyBodyCrons.schedule();
          this.macroCaptchaCrons.schedule();
          this.totalAvailableGold.schedule();
          this.marketplaceCrons.schedule();
          this.rankingCrons.schedule();
          this.redisCrons.schedule();
          this.databaseMonitorCrons.schedule();
          this.removeInactivePartyMembersCron.schedule();
          this.discordCronJobs.schedule();
          this.resourceGatheringCronJobs.schedule();
          this.premiumAccountCrons.schedule();
          this.referralBonusCrons.schedule();
          this.plantCrons.schedule();
          this.queueCrons.schedule();
          this.characterTradingCrons.schedule();
          this.bonusXpEventCrons.schedule();
          this.guildCrons.schedule();
        }
        break;
    }
  }
}
