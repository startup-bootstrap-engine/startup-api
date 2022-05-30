import { NPC } from "@entities/ModuleNPC/NPCModel";
import { NPCSpawn } from "@providers/npc/NPCSpawn";
import { provide } from "inversify-binding-decorators";

import nodeCron from "node-cron";

@provide(NPCCrons)
export class NPCCrons {
  constructor(private npcSpawn: NPCSpawn) {}

  public schedule(): void {
    nodeCron.schedule("* * * * *", async () => {
      // filter all dead npcs that have a nextSpawnTime > now

      const deadNPCs = await NPC.find({
        health: 0,
        nextSpawnTime: {
          $lte: new Date(),
        },
      });

      for (const deadNPC of deadNPCs) {
        console.log(`💀 NPC ${deadNPC.name} is dead and will be respawned`);
        await this.npcSpawn.spawn(deadNPC);
      }
    });
  }
}
