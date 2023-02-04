/* eslint-disable no-undef */
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import random from "lodash/random";
import { NPC_BATTLE_CYCLES } from "./NPCBattleCycle";
import { NPC_CYCLES } from "./NPCCycle";
import { NPCView } from "./NPCView";

import { appEnv } from "@providers/config/env";
import CPUusage from "cpu-percentage";
import round from "lodash/round";

@provideSingleton(NPCFreezer)
export class NPCFreezer {
  public freezeCheckIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(private npcView: NPCView) {
    if (appEnv.general.IS_UNIT_TEST) {
      return;
    }

    const start = CPUusage();

    setInterval(async () => {
      console.log("Checking to freeze NPCs...");

      console.log(`
        NPC_CYCLES: ${NPC_CYCLES.size}
        NPC_BATTLE_CYCLES: ${NPC_BATTLE_CYCLES.size}
      `);

      const end = CPUusage(start);
      const usage = round(end.percent);

      const totalActiveNPCS = await NPC.countDocuments({ isBehaviorEnabled: true });

      console.log(`Total active NPCs: ${totalActiveNPCS}`);

      console.log(`CPU usage is ${usage}%`);

      if (usage > 100) {
        for (let i = 0; i <= totalActiveNPCS * 0.5; i++) {
          await this.freezeRandomNPC(usage);
        }
      } else if (usage > 80 && usage < 100) {
        for (let i = 0; i <= totalActiveNPCS * 0.3; i++) {
          await this.freezeRandomNPC(usage);
        }
      } else if (usage > 60 && usage < 80) {
        for (let i = 0; i <= totalActiveNPCS * 0.1; i++) {
          await this.freezeRandomNPC(usage);
        }
      }
    }, 5000);
  }

  public tryToFreezeNPC(npc: INPC): void {
    if (this.freezeCheckIntervals.has(npc.id)) {
      return; // interval is already, running, lets not create another one!
    }

    // every 5-10 seconds, check if theres a character nearby. If not, shut down NPCCycle.
    const checkRange = random(2000, 4000);

    const interval = setInterval(async () => {
      const shouldFreezeNPC = await this.shouldFreezeNPC(npc);

      if (!shouldFreezeNPC) {
        return;
      }

      await this.freezeNPC(npc);

      clearInterval(interval);
    }, checkRange);

    this.freezeCheckIntervals.set(npc.id, interval);
  }

  public async freezeNPC(npc: INPC, isForced?: boolean): Promise<void> {
    console.log(`Freezing NPC ${npc.key} (${npc.id}) ${isForced ? "(FORCED)" : ""}`);

    await NPC.updateOne({ _id: npc._id }, { isBehaviorEnabled: false });
    const npcCycle = NPC_CYCLES.get(npc.id);

    if (npcCycle) {
      await npcCycle.clear();
    }

    const battleCycle = NPC_BATTLE_CYCLES.get(npc.id);

    if (battleCycle) {
      await battleCycle.clear();
    }

    this.freezeCheckIntervals.delete(npc.id);
  }

  private async shouldFreezeNPC(npc: INPC): Promise<boolean> {
    const nearbyCharacters = await this.npcView.getCharactersInView(npc);

    return !nearbyCharacters.length;
  }

  private async freezeRandomNPC(usage: number): Promise<void> {
    const npcIds = Array.from(NPC_CYCLES.keys());
    const randomNpcId = random(0, npcIds.length - 1);
    const npcCycle = NPC_CYCLES.get(npcIds[randomNpcId]);

    if (!npcCycle) {
      return;
    }

    const npc = await NPC.findById(npcCycle.id);

    if (!npc) {
      throw new Error(`Failed to freeze NPC! NPC ${npcCycle.id} not found`);
    }

    await this.freezeNPC(npc, true);
  }
}
