/* eslint-disable no-void */
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";

import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { NPC_MIN_DISTANCE_TO_ACTIVATE } from "@providers/constants/NPCConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { provide } from "inversify-binding-decorators";
import { NPCView } from "./NPCView";

import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { Locker } from "@providers/locks/Locker";
import { MathHelper } from "@providers/math/MathHelper";
import { RaidManager } from "@providers/raid/RaidManager";
import { Time } from "@providers/time/Time";
import { NPCCycleQueue } from "./NPCCycleQueue";

@provide(NPCManager)
export class NPCManager {
  constructor(
    private npcView: NPCView,
    private inMemoryHashTable: InMemoryHashTable,

    private mathHelper: MathHelper,
    private raidManager: RaidManager,
    private npcCycleQueue: NPCCycleQueue,
    private locker: Locker,
    private time: Time
  ) {}

  @TrackNewRelicTransaction()
  public async startNearbyNPCsBehaviorLoop(character: ICharacter): Promise<void> {
    const nearbyNPCs = await this.npcView.getNPCsInView(character, { isBehaviorEnabled: false });

    const npcsToActivate = nearbyNPCs.filter(
      (npc) =>
        this.mathHelper.getDistanceInGridCells(npc.x, npc.y, character.x, character.y) <= NPC_MIN_DISTANCE_TO_ACTIVATE
    );

    //! Dont use Promise.all here. This will lead to some NPCs getting stuck
    for (const npc of npcsToActivate) {
      await this.startBehaviorLoop(npc);
    }
  }

  @TrackNewRelicTransaction()
  public async startBehaviorLoop(initialNPC: INPC): Promise<void> {
    const npc = initialNPC;

    if (!npc) {
      return;
    }

    const canProceed = await this.locker.lock(`npc-${npc._id}-npc-cycle`);

    if (!canProceed) {
      return;
    }

    if (npc) {
      await this.inMemoryHashTable.set("npc", npc._id, npc);
    }

    const isRaidNPC = npc.raidKey !== undefined;

    const isRaidNPCActive = npc.raidKey && (await this.raidManager.isRaidActive(npc.raidKey!));

    if (isRaidNPC && !isRaidNPCActive) {
      return;
    }

    if (!npc.isBehaviorEnabled) {
      await this.setNPCBehavior(npc, true);

      // eslint-disable-next-line mongoose-lean/require-lean
      const npcSkills = (await Skill.find({ owner: npc._id })
        .lean()
        .cacheQuery({
          cacheKey: `npc-${npc.id}-skills`,
        })) as unknown as ISkill;

      await this.npcCycleQueue.addToQueue(npc, npcSkills);
    }
  }

  @TrackNewRelicTransaction()
  public async disableNPCBehaviors(): Promise<void> {
    await NPC.updateMany({}, { $set: { isBehaviorEnabled: false } }).lean();
  }

  @TrackNewRelicTransaction()
  public async setNPCBehavior(npc: INPC, value: boolean): Promise<void> {
    await NPC.updateOne({ _id: npc._id }, { $set: { isBehaviorEnabled: value } }).lean();
  }
}
