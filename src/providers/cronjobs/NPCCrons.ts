import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { NPCFreezer } from "@providers/npc/NPCFreezer";
import { NPCSpawn } from "@providers/npc/NPCSpawn";
import { NPCRaidActivator } from "@providers/raid/NPCRaidActivator";
import { NPCRaidSpawn } from "@providers/raid/NPCRaidSpawn";

import { provide } from "inversify-binding-decorators";

import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { NPCCycleTracker } from "@providers/npc/NPCCycleTracker";
import { NPCDuplicateCleaner } from "@providers/npc/NPCDuplicateCleaner";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(NPCCrons)
export class NPCCrons {
  constructor(
    private npcSpawn: NPCSpawn,
    private newRelic: NewRelic,
    private npcRaidSpawn: NPCRaidSpawn,
    private npcRaidActivator: NPCRaidActivator,
    private npcFreezer: NPCFreezer,
    private cronJobScheduler: CronJobScheduler,
    private npcDuplicateChecker: NPCDuplicateCleaner,
    private inMemoryHashTable: InMemoryHashTable,
    private npcCycleTracker: NPCCycleTracker
  ) {}

  public schedule(): void {
    this.cronJobScheduler.uniqueSchedule("npc-spawn-cron", "* * * * *", async () => {
      await this.npcSpawnCron();
    });

    this.cronJobScheduler.uniqueSchedule("npc-raid-activator", "*/55 * * * *", async () => {
      console.log("Trying to activate raids...");
      await this.npcRaidActivator.activateRaids();
    });

    this.cronJobScheduler.uniqueSchedule("npc-raid-shutdown", "*/3 * * * *", async () => {
      await this.npcRaidActivator.shutdownRaids();
    });
    this.cronJobScheduler.uniqueSchedule("npc-freezer", "* * * * *", async () => {
      await this.npcFreezer.freezeNPCsWithoutCharactersAround();
    });

    this.cronJobScheduler.uniqueSchedule("npc-duplicate-checker", "0 0 * * *", async () => {
      await this.npcDuplicateChecker.cleanupDuplicateNPCs();
    });

    this.cronJobScheduler.uniqueSchedule("npc-active-count", "* * * * *", async () => {
      await this.calculateActiveNPCs();
    });

    this.cronJobScheduler.uniqueSchedule("npc-cycle-tracker", "* * * * *", async () => {
      const avg = await this.npcCycleTracker.getOverallAverageCycleTime();

      this.newRelic.trackMetric(NewRelicMetricCategory.Count, NewRelicSubCategory.NPCs, "NPCCycleIntervalAvg", avg);
    });
  }

  private async calculateActiveNPCs(): Promise<void> {
    const totalActiveNPCs = await NPC.countDocuments({ isBehaviorEnabled: true });

    this.newRelic.trackMetric(NewRelicMetricCategory.Count, NewRelicSubCategory.NPCs, "Active", totalActiveNPCs);

    await this.inMemoryHashTable.set("activity-tracker", "npc-count", totalActiveNPCs);
  }

  private async npcSpawnCron(): Promise<void> {
    // filter all dead npcs that have a nextSpawnTime > now

    const deadNPCs = (await NPC.find({
      health: 0,
      isBehaviorEnabled: false,
      nextSpawnTime: {
        $exists: true,
        $lte: new Date(),
      },
    }).lean()) as INPC[];

    const deadRaidNPCs = await this.npcRaidSpawn.fetchDeadNPCsFromActiveRaids();

    deadNPCs.push(...deadRaidNPCs);

    for (const deadNPC of deadNPCs) {
      await this.npcSpawn.spawn(deadNPC, !!deadNPC.raidKey);
    }
  }
}
