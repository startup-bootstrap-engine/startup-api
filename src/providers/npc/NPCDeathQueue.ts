import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";

import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { blueprintManager } from "@providers/inversify/container";
import { ItemOwnership } from "@providers/item/ItemOwnership";
import { AvailableBlueprints } from "@providers/item/data/types/itemsBlueprintTypes";
import { Locker } from "@providers/locks/Locker";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { BattleSocketEvents, CharacterPartyBenefits, EntityType, IBattleDeath, INPCLoot } from "@rpg-engine/shared";
import { NPCExperience } from "./NPCExperience/NPCExperience";
import { NPCFreezer } from "./NPCFreezer";
import { NPCLoot } from "./NPCLoot";
import { NPCSpawn } from "./NPCSpawn";
import { NPCTarget } from "./movement/NPCTarget";

import { CharacterView } from "@providers/character/CharacterView";
import { appEnv } from "@providers/config/env";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { PartyCRUD } from "@providers/party/PartyCRUD";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
@provideSingleton(NPCDeathQueue)
export class NPCDeathQueue {
  constructor(
    private socketMessaging: SocketMessaging,
    private npcTarget: NPCTarget,
    private itemOwnership: ItemOwnership,
    private characterView: CharacterView,

    private npcFreezer: NPCFreezer,
    private npcSpawn: NPCSpawn,
    private npcExperience: NPCExperience,
    private locker: Locker,
    private newRelic: NewRelic,
    private npcLoot: NPCLoot,
    private dynamicQueue: DynamicQueue,
    private partyCRUD: PartyCRUD
  ) {}

  public async handleNPCDeath(killer: ICharacter, npc: INPC): Promise<void> {
    if (appEnv.general.IS_UNIT_TEST) {
      await this.execHandleNPCDeath(killer, npc);
      return;
    }

    await this.dynamicQueue.addJob(
      "npc-death",
      (job) => {
        const { killer, npc } = job.data;

        void this.execHandleNPCDeath(killer, npc);
      },
      { killer, npc }
    );
  }

  @TrackNewRelicTransaction()
  private async execHandleNPCDeath(killer: ICharacter, npc: INPC): Promise<void> {
    try {
      await this.npcFreezer.freezeNPC(npc, "NPCDeath");
      const hasLocked = await this.locker.lock(`npc-death-${npc._id}`);
      if (!hasLocked) {
        return;
      }
      const npcWithSkills = await this.getNPCWithSkills(npc);

      console.info("NPCDeath for npc: ", npc.key);
      if (npc.health !== 0) {
        npc = (await NPC.findOneAndUpdate({ _id: npc._id }, { $set: { health: 0 } }, { new: true })) as unknown as INPC;
      }

      const npcBody = await this.generateNPCBody(npc);
      if (!npcBody) {
        return;
      }

      const goldLoot = this.npcLoot.getGoldLoot(npcWithSkills);
      const totalDropRatioFromParty = await this.calculateTotalDropRatioFromParty(npc);

      const npcLoots: INPCLoot[] = (npc.loots as unknown as INPCLoot[]).map((loot) => ({
        itemBlueprintKey: loot.itemBlueprintKey,
        chance: loot.chance + totalDropRatioFromParty || 0,
        quantityRange: loot.quantityRange || undefined,
      }));

      const addLootToNPCBodyPromise = this.npcLoot.addLootToNPCBody(
        killer,
        npc,
        npcBody,
        [...npcLoots, goldLoot],
        npc.isGiantForm
      );

      const removeItemOwnershipPromise = this.itemOwnership.removeItemOwnership(npcBody);
      const clearNPCBehaviorPromise = this.clearNPCBehavior(npc);
      const releaseXPPromise = this.npcExperience.releaseXP(npc as INPC);

      this.newRelic.trackMetric(NewRelicMetricCategory.Count, NewRelicSubCategory.NPCs, "Death", 1);

      await Promise.all([
        addLootToNPCBodyPromise,
        removeItemOwnershipPromise,
        clearNPCBehaviorPromise,
        releaseXPPromise,
      ]);

      await this.updateNPCAfterDeath(npcWithSkills);
    } catch (error) {
      console.error(error);
    } finally {
      await this.notifyCharactersOfNPCDeath(npc);
    }
  }

  private async notifyCharactersOfNPCDeath(npc: INPC): Promise<void> {
    await this.socketMessaging.sendEventToCharactersAroundNPC<IBattleDeath>(npc, BattleSocketEvents.BattleDeath, {
      id: npc._id,
      type: "NPC",
    });
  }

  private async getNPCWithSkills(npc: INPC): Promise<INPC> {
    const npcFound = (await NPC.findById(npc._id).lean({
      virtuals: true,
      defaults: true,
    })) as INPC;

    if (!npcFound) {
      throw new Error(`NPC not found with id ${npc._id}`);
    }

    const npcSkills = (await Skill.findOne({
      _id: npcFound.skills,
    }).lean({
      virtuals: true,
      defaults: true,
    })) as ISkill;

    npcFound.skills = npcSkills;

    return npcFound;
  }

  private async updateNPCAfterDeath(npc: INPC): Promise<void> {
    const skills = npc.skills as ISkill;

    const strengthLevel = skills?.strength?.level ?? 1;

    const nextSpawnTime = this.npcSpawn.calculateSpawnTime(strengthLevel);
    const currentMovementType = npc.originalMovementType;

    await NPC.updateOne(
      { _id: npc.id, scene: npc.scene },
      {
        $set: {
          health: 0,
          nextSpawnTime,
          currentMovementType: currentMovementType,
          appliedEntityEffects: undefined,
          isBehaviorEnabled: false,
        },
      }
    );
  }

  @TrackNewRelicTransaction()
  public async generateNPCBody(npc: INPC): Promise<IItem | undefined> {
    const hasLock = await this.locker.lock(`npc-body-generation-${npc._id}`);

    if (!hasLock) {
      return;
    }

    const blueprintData = await blueprintManager.getBlueprint<IItem>("items", "npc-body" as AvailableBlueprints);
    const npcBody = new Item({
      ...blueprintData, // base body props
      key: `${npc.key}-body`,
      bodyFromId: npc.id,
      texturePath: `${npc.textureKey}/death/0.png`,
      textureKey: npc.textureKey,
      name: `${npc.name}'s body`,
      description: `You see ${npc.name}'s body.`,
      scene: npc.scene,
      x: npc.x,
      y: npc.y,
      deadBodyEntityType: EntityType.NPC,
    });

    return await npcBody.save();
  }

  private async clearNPCBehavior(npc: INPC): Promise<void> {
    await this.npcTarget.clearTarget(npc);
  }

  private async calculateTotalDropRatioFromParty(npc: INPC): Promise<number> {
    let totalDropRatio = 0;
    let partyIds = new Set<string>();
    if (npc.xpToRelease) {
      partyIds = new Set(
        npc.xpToRelease.filter((xp) => xp.partyId !== null).map((xp) => xp.partyId as unknown as string)
      );
    }
    if (partyIds.size === 0) {
      return 0;
    }
    for (const partyId of partyIds) {
      totalDropRatio += await this.getPartyAndCalculateDropRatio(partyId);
    }
    return totalDropRatio || 0;
  }

  private async getPartyAndCalculateDropRatio(partyId: string): Promise<number> {
    const party = await this.partyCRUD.findById(partyId.toString());

    if (party?.benefits) {
      const dropRatioBenefit = party.benefits.find((benefits) => benefits.benefit === CharacterPartyBenefits.DropRatio);
      return dropRatioBenefit?.value || 0;
    }
    return 0;
  }

  public async clearAllJobs(): Promise<void> {
    await this.dynamicQueue.clearAllJobs();
  }

  public async shutdown(): Promise<void> {
    await this.dynamicQueue.shutdown();
  }
}
