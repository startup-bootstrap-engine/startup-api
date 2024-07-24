import { CharacterConnection } from "@providers/character/CharacterConnection";

import { CharacterTextureChange } from "@providers/character/CharacterTextureChange";
import { CharacterBuffActivator } from "@providers/character/characterBuff/CharacterBuffActivator";
import { PathfindingQueue } from "@providers/map/PathfindingQueue";
import { NPCManager } from "@providers/npc/NPCManager";
import { PushNotificationHelper } from "@providers/pushNotification/PushNotificationHelper";
import { Seeder } from "@providers/seeds/Seeder";

import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { HitTargetQueue } from "@providers/battle/HitTargetQueue";
import { CharacterActionsTracker } from "@providers/character/CharacterActionsTracker";
import { CharacterConsumptionControl } from "@providers/character/CharacterConsumptionControl";
import { CharacterMonitorCallbackTracker } from "@providers/character/CharacterMonitorInterval/CharacterMonitorCallbackTracker";
import { CharacterNetworkUpdateQueue } from "@providers/character/network/CharacterNetworkUpdate/CharacterNetworkUpdateQueue";
import { CharacterNetworkCreateQueue } from "@providers/character/network/characterCreate/CharacterNetworkCreateQueue";
import { ChatNetworkGlobalMessagingQueue } from "@providers/chat/network/ChatNetworkGlobalMessagingQueue";
import { appEnv } from "@providers/config/env";
import { cache } from "@providers/constants/CacheConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { DiscordBot } from "@providers/discord/DiscordBot";
import { EntityEffectDurationControl } from "@providers/entityEffects/EntityEffectDurationControl";
import { ErrorHandlingTracker } from "@providers/errorHandling/ErrorHandlingTracker";
import { ItemCraftbookQueue } from "@providers/item/ItemCraftbookQueue";
import { ItemDropVerifier } from "@providers/item/ItemDrop/ItemDropVerifier";
import { ItemUseCycleQueue } from "@providers/item/ItemUseCycleQueue";
import { ItemContainerTransactionQueue } from "@providers/itemContainer/ItemContainerTransactionQueue";
import { Locker } from "@providers/locks/Locker";
import { NPCBattleCycleQueue } from "@providers/npc/NPCBattleCycleQueue";
import { NPCCycleQueue } from "@providers/npc/NPCCycleQueue";
import { NPCCycleTracker } from "@providers/npc/NPCCycleTracker";
import { NPCDeathQueue } from "@providers/npc/NPCDeathQueue";
import { NPCFreezer } from "@providers/npc/NPCFreezer";
import { PartyCRUD } from "@providers/party/PartyCRUD";
import { PatreonAPI } from "@providers/patreon/PatreonAPI";
import { ResultsPoller } from "@providers/poller/ResultsPoller";
import { QueueActivityMonitor } from "@providers/queue/QueueActivityMonitor";
import { RaidManager } from "@providers/raid/RaidManager";
import { SkillBuffQueue } from "@providers/skill/SkillBuffQueue";
import { SocketSessionControl } from "@providers/sockets/SocketSessionControl";
import { ManaShield } from "@providers/spells/data/logic/mage/ManaShield";
import SpellSilence from "@providers/spells/data/logic/mage/druid/SpellSilence";
import { BullStrength } from "@providers/spells/data/logic/minotaur/BullStrength";
import { SpellNetworkCastQueue } from "@providers/spells/network/SpellNetworkCastQueue";
import { Cooldown } from "@providers/time/Cooldown";
import { UseWithTileQueue } from "@providers/useWith/abstractions/UseWithTileQueue";
import { EnvType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { PM2Helper } from "./PM2Helper";

@provide(ServerBootstrap)
export class ServerBootstrap {
  constructor(
    private pm2Helper: PM2Helper,
    private npcManager: NPCManager,
    private seeder: Seeder,
    private characterConnection: CharacterConnection,
    private characterConsumptionControl: CharacterConsumptionControl,
    private pathfindingQueue: PathfindingQueue,
    private characterBuffActivator: CharacterBuffActivator,
    private spellSilence: SpellSilence,
    private characterTextureChange: CharacterTextureChange,
    private npcFreezer: NPCFreezer,
    private locker: Locker,
    private partyCRUD: PartyCRUD,
    private inMemoryHashTable: InMemoryHashTable,
    private hitTarget: HitTargetQueue,
    private discordBot: DiscordBot,
    private socketSessionControl: SocketSessionControl,
    private npcBattleCycleQueue: NPCBattleCycleQueue,
    private npcCycleQueue: NPCCycleQueue,
    private itemUseCycleQueue: ItemUseCycleQueue,
    private entityEffectDuration: EntityEffectDurationControl,
    private characterMonitorCallbackTracker: CharacterMonitorCallbackTracker,
    private characterNetworkUpdateQueue: CharacterNetworkUpdateQueue,
    private characterNetworkCreateQueue: CharacterNetworkCreateQueue,
    private patreonAPI: PatreonAPI,
    private useWithTileQueue: UseWithTileQueue,
    private chatNetworkGlobalMessaging: ChatNetworkGlobalMessagingQueue,
    private spellNetworkCast: SpellNetworkCastQueue,
    private characterActionsTracker: CharacterActionsTracker,
    private errorHandlingTracker: ErrorHandlingTracker,
    private bullStrength: BullStrength,
    private npcDeathQueue: NPCDeathQueue,
    private itemContainerTransactionQueue: ItemContainerTransactionQueue,
    private itemDropVerifier: ItemDropVerifier,
    private queueActivityMonitor: QueueActivityMonitor,
    private raidManager: RaidManager,
    private manaShield: ManaShield,
    private cooldown: Cooldown,
    private skillBuffQueue: SkillBuffQueue,
    private itemCraftbookQueue: ItemCraftbookQueue,
    private npcCycleTracker: NPCCycleTracker,
    private resultsPoller: ResultsPoller
  ) {}

  // operations that can be executed in only one CPU instance without issues with pm2 (ex. setup centralized state doesnt need to be setup in every pm2 instance!)
  @TrackNewRelicTransaction()
  public async performOneTimeOperations(): Promise<void> {
    if (appEnv.general.ENV === EnvType.Development) {
      // in dev we always want to execute it.. since we dont have pm2
      await this.execOneTimeOperations();
    } else {
      // Production/Staging with PM2
      if (process.env.pm_id === this.pm2Helper.pickLastCPUInstance()) {
        await this.execOneTimeOperations();
      }
    }
  }

  @TrackNewRelicTransaction()
  public async performMultipleInstancesOperations(): Promise<void> {
    cache.clear();

    this.discordBot.initialize();

    await this.queueShutdownHandling();

    await this.clearSomeQueues();

    this.errorHandlingTracker.overrideDebugHandling();

    if (appEnv.general.ENV === EnvType.Production) {
      this.errorHandlingTracker.overrideErrorHandling();

      this.addUnhandledRejectionListener();
    }
  }

  public queueShutdownHandling(): void {
    const execQueueShutdown = async (): Promise<void> => {
      await this.hitTarget.shutdown();
      await this.pathfindingQueue.shutdown();
      await this.itemUseCycleQueue.shutdown();
      await this.npcBattleCycleQueue.shutdown();
      await this.npcCycleQueue.shutdown();
      await this.characterNetworkUpdateQueue.shutdown();
      await this.useWithTileQueue.shutdown();
      await this.chatNetworkGlobalMessaging.shutdown();
      await this.spellNetworkCast.shutdown();
      await this.npcDeathQueue.shutdown();
      await this.itemContainerTransactionQueue.shutdown();
      await this.characterNetworkCreateQueue.shutdown();
    };

    process.on("SIGTERM", async () => {
      await execQueueShutdown();

      process.exit(0);
    });

    process.on("SIGINT", async () => {
      await execQueueShutdown();
      process.exit(0);
    });
  }

  private async execOneTimeOperations(): Promise<void> {
    this.patreonAPI.initialize();

    await this.socketSessionControl.clearAllSessions();

    await this.npcManager.disableNPCBehaviors();

    await this.characterConnection.resetCharacterAttributes();
    await this.characterConsumptionControl.clearAllItemConsumption();
    await this.characterBuffActivator.disableAllTemporaryBuffsAllCharacters();
    await this.partyCRUD.clearAllParties();

    await this.spellSilence.removeAllSilence();

    await this.characterTextureChange.removeAllTextureChange();

    await this.inMemoryHashTable.deleteAll("crafting-recipes");
    await this.inMemoryHashTable.deleteAll("craftable-item-ingredients");
    await this.inMemoryHashTable.deleteAll("load-craftable-items");
    await this.inMemoryHashTable.deleteAll("channel-bound-events");
    await this.inMemoryHashTable.deleteAll("raids");
    await this.inMemoryHashTable.deleteAll("npc-target-check-count");
    await this.inMemoryHashTable.deleteAll("use-item-to-tile");
    await this.inMemoryHashTable.deleteAll("character-bonus-penalties");
    await this.inMemoryHashTable.deleteAll("skills-with-buff");
    await this.inMemoryHashTable.deleteAll("item-container-transfer-results");
    await this.raidManager.deleteAllRaids();
    await this.itemDropVerifier.clearAllItemDrops();

    await this.cooldown.clearAll();

    await this.manaShield.clearAllManaShields();

    await this.entityEffectDuration.clearAll();
    await this.characterMonitorCallbackTracker.clearAll();

    await this.bullStrength.clearAllGiantForms();

    await this.resultsPoller.clearAll();

    await this.npcCycleTracker.clearAllData();

    await this.characterActionsTracker.clearAllCharacterActions();

    // Firebase-admin setup, that push notification requires.
    PushNotificationHelper.initialize();

    // this.heapMonitor.monitor();

    await this.seeder.start();

    this.npcFreezer.init();

    await this.locker.clear();
  }

  private addUnhandledRejectionListener(): void {
    process.on("uncaughtException", (err) => {
      console.error("❌ Uncaught Exception:", err);
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    });
  }

  private async clearSomeQueues(): Promise<void> {
    await this.queueActivityMonitor.clearAllQueues();

    await this.pathfindingQueue.clearAllJobs();
    await this.hitTarget.clearAllJobs();
    await this.itemUseCycleQueue.clearAllJobs();
    await this.npcBattleCycleQueue.clearAllJobs();
    await this.characterNetworkUpdateQueue.clearAllJobs();
    await this.useWithTileQueue.clearAllJobs();
    await this.chatNetworkGlobalMessaging.clearAllJobs();
    await this.spellNetworkCast.clearAllJobs();
    await this.npcDeathQueue.clearAllJobs();
    await this.characterNetworkCreateQueue.clearAllJobs();
    await this.npcCycleQueue.clearAllJobs();
    await this.skillBuffQueue.clearAllJobs();
    await this.itemCraftbookQueue.clearAllJobs();

    console.log("🧹 BullMQ queues cleared!");
  }
}
