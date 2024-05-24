import { Character } from "@entities/ModuleCharacter/CharacterModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { NPC_FREEZE_CHECK_INTERVAL } from "@providers/constants/NPCConstants";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { MathHelper } from "@providers/math/MathHelper";
import { NPCView } from "./NPCView";

@provideSingleton(NPCFreezer)
export class NPCFreezer {
  constructor(private mathHelper: MathHelper, private npcView: NPCView, private locker: Locker) {}

  public init(): void {
    this.monitorNPCsAndFreezeIfNeeded();
  }

  @TrackNewRelicTransaction()
  public async freezeNPC(npc: INPC, reason?: string): Promise<void> {
    try {
      if (!npc.isBehaviorEnabled) {
        return;
      }

      console.log(`❄️ Freezing NPC ${npc.key} (${npc._id}) ${reason ? `- Reason: ${reason}` : ""}`);
      await NPC.updateOne(
        { _id: npc._id },
        {
          $set: {
            isBehaviorEnabled: false,
          },
          $unset: {
            targetCharacter: 1,
          },
        }
      );

      await this.locker.unlock(`npc-${npc._id}-npc-cycle`);
      await this.locker.unlock(`npc-${npc._id}-npc-battle-cycle`);
    } catch (error) {
      console.error(error);
    }
  }

  @TrackNewRelicTransaction()
  public async freezeNPCsWithoutCharactersAround(): Promise<void> {
    const activeNPCs = await NPC.find({
      isBehaviorEnabled: true,
    });

    const inactiveNPCPromises: any[] = [];

    for (const npc of activeNPCs) {
      const charactersAround = await this.npcView.getCharactersInView(npc);

      if (charactersAround.length === 0) {
        inactiveNPCPromises.push(this.freezeNPC(npc, "NPCFreezer - No characters around"));
      }

      if (!npc.targetCharacter) {
        inactiveNPCPromises.push(this.freezeNPC(npc, "NPCFreezer - No target character"));
      }
    }

    await Promise.all(inactiveNPCPromises);
  }

  private monitorNPCsAndFreezeIfNeeded(): void {
    setInterval(async () => {
      const canCheck = await this.locker.lock("npc-freeze-check", 1000);

      if (!canCheck) {
        return;
      }

      const totalActiveNPCs = await NPC.countDocuments({ isBehaviorEnabled: true });

      const freezeTasks: any[] = [];

      // Freeze NPCs that are farthest from any active characters
      const farthestNPCs = await this.findFarthestNPCs();
      for (const npc of farthestNPCs) {
        freezeTasks.push(this.freezeNPC(npc, "NPCFreezer - Farthest NPC freeze"));
      }

      console.log(`TOTAL_ACTIVE_NPCS: ${totalActiveNPCs}`);
      await Promise.all(freezeTasks);
    }, NPC_FREEZE_CHECK_INTERVAL);
  }

  private async findFarthestNPCs(): Promise<INPC[]> {
    const activeNPCs = (await NPC.find({
      isBehaviorEnabled: true,
    }).lean()) as INPC[];

    const activeCharacters = await Character.find().lean();

    return activeNPCs
      .map((npc) => {
        const distances = activeCharacters.map((character) =>
          this.mathHelper.getDistanceBetweenPoints(npc.x, npc.y, character.x, character.y)
        );
        const minDistance = Math.min(...distances);
        return { npc, minDistance };
      })
      .sort((a, b) => b.minDistance - a.minDistance)
      .slice(0, Math.ceil(activeNPCs.length * 0.1)) // Freeze the farthest 10% of NPCs
      .map(({ npc }) => npc);
  }

  @TrackNewRelicTransaction()
  private async freezeFarthestTargetingNPC(): Promise<void> {
    const npcs = await NPC.find({
      isBehaviorEnabled: true,
      targetCharacter: { $exists: true },
    })
      .lean()
      .select("key x y targetCharacter scene");

    const targetCharacterIds = npcs.map((npc) => npc.targetCharacter);
    const characters = await Character.find({ _id: { $in: targetCharacterIds } }).lean();

    let maxDistance = -Infinity;
    let npcToFreeze: INPC | null = null;

    for (const npc of npcs) {
      const targetCharacter = characters.find((character) => String(character._id) === String(npc.targetCharacter));

      if (!targetCharacter) continue;

      const distance = this.mathHelper.getDistanceBetweenPoints(npc.x, npc.y, targetCharacter.x, targetCharacter.y);
      if (distance > maxDistance) {
        maxDistance = distance;
        npcToFreeze = npc as INPC;
      }
    }

    if (npcToFreeze) {
      console.log(`❄️ Freezing farthest targeted NPC ${npcToFreeze.key} (${npcToFreeze._id})`);
      try {
        await this.freezeNPC(npcToFreeze, "NPCFreezer - Farthest targeting NPC freeze");
      } catch (error) {
        console.error(`Failed to freeze NPC ${npcToFreeze._id}: ${error.message}`);
      }
    }
  }
}
