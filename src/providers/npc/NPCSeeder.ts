import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { rollDice } from "@providers/constants/DiceConstants";
import {
  NPC_BASE_HEALTH_MULTIPLIER,
  NPC_SKILL_DEXTERITY_MULTIPLIER,
  NPC_SKILL_LEVEL_MULTIPLIER,
  NPC_SKILL_STRENGTH_MULTIPLIER,
  NPC_SPEED_MULTIPLIER,
} from "@providers/constants/NPCConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { blueprintManager } from "@providers/inversify/container";
import { Locker } from "@providers/locks/Locker";
import { GridManager } from "@providers/map/GridManager";
import { INPCSeedData, NPCLoader } from "@providers/npc/NPCLoader";
import { ToGridX, ToGridY } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import _ from "lodash";
import { clearCacheForKey } from "speedgoose";
import { NPCDuplicateCleaner } from "./NPCDuplicateCleaner";
import { NPCGiantForm } from "./NPCGiantForm";
import { NPCHealthManaCalculator } from "./NPCHealthManaCalculator";

@provide(NPCSeeder)
export class NPCSeeder {
  constructor(
    private npcLoader: NPCLoader,
    private gridManager: GridManager,
    private npcGiantForm: NPCGiantForm,
    private locker: Locker,
    private inMemoryHashTable: InMemoryHashTable,
    private npcHealthManaCalculator: NPCHealthManaCalculator,
    private npcDuplicateCleaner: NPCDuplicateCleaner
  ) {}

  @TrackNewRelicTransaction()
  public async seed(): Promise<void> {
    const npcSeedData = await this.npcLoader.loadNPCSeedData();
    const npcDataArray = Array.from(npcSeedData.values());
    const existingNPCs = await this.fetchExistingNPCs(npcDataArray);

    const npcPromises = npcDataArray.map(async (NPCData) => {
      const npcFound = this.findExistingNPC(existingNPCs, NPCData);
      await this.setInitialNPCPositionAsSolid(NPCData);
      const customizedNPC = this.getNPCDataWithMultipliers(NPCData);

      if (!npcFound) {
        return this.createNewNPCWithSkills(customizedNPC);
      } else {
        return this.handleExistingNPC(npcFound);
      }
    });

    await Promise.all(npcPromises);

    await this.npcDuplicateCleaner.cleanupDuplicateNPCs();
  }

  private async fetchExistingNPCs(npcDataArray: INPCSeedData[]): Promise<INPC[]> {
    return (await NPC.find({
      tiledId: { $in: npcDataArray.map((data) => data.tiledId) },
      scene: { $in: npcDataArray.map((data) => data.scene) },
    }).lean({ virtuals: true, defaults: true })) as unknown as INPC[];
  }

  private findExistingNPC(existingNPCs: INPC[], NPCData: INPCSeedData): INPC | undefined {
    return existingNPCs.find((npc) => npc.tiledId === NPCData.tiledId && npc.scene === NPCData.scene);
  }

  private async handleExistingNPC(npcFound: INPC): Promise<void> {
    if (npcFound.isBehaviorEnabled) {
      return; // skip if already active...
    }

    await this.resetNPC(npcFound);

    await this.npcGiantForm.resetNPCToNormalForm(npcFound);

    await this.tryToUpdateSkills(npcFound);

    await this.npcGiantForm.randomlyTransformNPCIntoGiantForm(npcFound);
  }

  private async tryToUpdateSkills(npcFound: INPC): Promise<void> {
    const cachedNPCSkills = await this.fetchCachedSkills(npcFound);
    const npcBlueprintSkills = this.fetchNPCBlueprint(npcFound)?.skills as ISkill;

    if (npcBlueprintSkills) {
      // note that not all NPC has blueprint skills. Friendly ones do not need this info specified on the blueprint, although they do have skills on the database

      if (!cachedNPCSkills || !npcBlueprintSkills || !_.isMatch(cachedNPCSkills, npcBlueprintSkills)) {
        const blueprintSkills = this.createBlueprintSkills(npcBlueprintSkills);

        await clearCacheForKey(`${npcFound._id}-skills`);

        await Skill.findOneAndUpdate({ _id: npcFound.skills }, { $set: blueprintSkills }, { new: true })
          .lean()
          .cacheQuery({
            cacheKey: `${npcFound._id}-skills`,
          });

        console.log(`⚠️ Updated skills for NPC ${npcFound.key}`);

        if (npcFound.isGiantForm) {
          await this.npcGiantForm.setNormalFormStats(npcFound, blueprintSkills as ISkill);
        }
      }
    }
  }

  private createBlueprintSkills(npcBlueprintSkills): Partial<ISkill> {
    return Object.entries(npcBlueprintSkills).reduce((acc, [key, value]) => {
      if (typeof value === "object" && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          acc[`${key}.${subKey}`] = subValue;
        });
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});
  }

  private async fetchCachedSkills(npcFound: INPC): Promise<ISkill> {
    return (await Skill.findOne({ _id: npcFound.skills })
      .lean()
      .cacheQuery({
        cacheKey: `${npcFound._id}-skills`,
      })) as unknown as ISkill;
  }

  private fetchNPCBlueprint(npcFound: INPC): INPC | undefined {
    return blueprintManager.getBlueprint<INPC>("npcs", npcFound.baseKey);
  }

  //! Please don't use new relic decorators here. It will cause huge spikes in our APM monitoring.
  private async resetNPC(npc: INPC): Promise<void> {
    try {
      await this.locker.unlock(`npc-death-${npc._id}`);
      await this.locker.unlock(`npc-body-generation-${npc._id}`);
      await this.locker.unlock(`npc-${npc._id}-release-xp`);
      await this.locker.unlock(`npc-${npc._id}-record-xp`);
      await this.locker.unlock(`npc-${npc._id}-npc-cycle`);
      await this.locker.unlock(`npc-${npc._id}-npc-battle-cycle`);

      await this.inMemoryHashTable.delete("npc-force-pathfinding-calculation", npc._id);

      const randomMaxHealth = this.npcHealthManaCalculator.getNPCMaxHealthRandomized(npc);

      const updateParams = {
        health: randomMaxHealth,
        maxHealth: randomMaxHealth,
        mana: npc.maxMana,
        x: npc.initialX,
        y: npc.initialY,
        currentMovementType: npc.originalMovementType,
        xpToRelease: [],
        isBehaviorEnabled: false,
      } as any;

      if (randomMaxHealth) {
        updateParams.health = randomMaxHealth;
        updateParams.maxHealth = randomMaxHealth;
      } else {
        updateParams.health = npc.maxHealth;
      }

      await NPC.updateOne(
        { _id: npc._id },
        {
          $set: updateParams,
          $unset: {
            nextSpawnTime: "",
            targetCharacter: "",
          },
        }
      );
    } catch (error) {
      console.log(`❌ Failed to reset NPC ${npc.key}`);
      console.error(error);
    }
  }

  private async createNewNPCWithSkills(NPCData: INPCSeedData): Promise<void> {
    try {
      const skills = new Skill({ ...(this.setNPCRandomSkillLevel(NPCData) as unknown as ISkill), ownerType: "NPC" }); // randomize skills present in the metadata only

      if (skills.level) {
        skills.level = skills.level * NPC_SKILL_LEVEL_MULTIPLIER;
      }
      if (skills.strength?.level) {
        skills.strength.level = skills.strength.level * NPC_SKILL_STRENGTH_MULTIPLIER;
      }
      if (skills.dexterity?.level) {
        skills.dexterity.level = skills.dexterity.level * NPC_SKILL_DEXTERITY_MULTIPLIER;
      }
      if (skills.resistance?.level) {
        skills.resistance.level = skills.resistance.level * NPC_SKILL_DEXTERITY_MULTIPLIER;
      }

      const npcHealth = this.npcHealthManaCalculator.getNPCMaxHealthRandomized(NPCData as unknown as INPC);

      const newNPC = new NPC({
        ...NPCData,
        health: npcHealth,
        maxHealth: npcHealth,
        skills: skills._id,
        isBehaviorEnabled: false,
      });
      await newNPC.save();

      skills.owner = newNPC._id;

      await skills.save();

      await this.npcGiantForm.resetNPCToNormalForm(newNPC);
      await this.npcGiantForm.randomlyTransformNPCIntoGiantForm(newNPC);
    } catch (error) {
      console.log(`❌ Failed to spawn NPC ${NPCData.key}. Is the blueprint for this NPC missing?`);
      console.log(NPCData);

      console.error(error);
    }
  }

  private getNPCDataWithMultipliers(NPCData: INPCSeedData): INPCSeedData {
    const multipliedData = { ...NPCData };

    if (multipliedData.speed) {
      multipliedData.speed = Math.round(multipliedData.speed * NPC_SPEED_MULTIPLIER * 100) / 100;
    }

    if (multipliedData.baseHealth) {
      multipliedData.baseHealth = Math.round(multipliedData.baseHealth * NPC_BASE_HEALTH_MULTIPLIER);
    }

    return multipliedData;
  }

  private setNPCRandomSkillLevel(NPCData: INPCSeedData): Object {
    // Deep cloning object because all equals NPCs seeds references the same object.
    const clonedNPC = _.cloneDeep(NPCData);
    if (!clonedNPC.skillRandomizerDice) return clonedNPC.skills;

    /**
     * If we have skills to be randomized we apply the randomDice value to that
     * if not we get all skills added in the blueprint to change it's level
     */
    const skillKeys: string[] = clonedNPC.skillsToBeRandomized
      ? clonedNPC.skillsToBeRandomized
      : Object.keys(clonedNPC.skills);

    for (const skill of skillKeys) {
      if (!clonedNPC.skills[skill]) continue;

      if (skill === "level") {
        clonedNPC.skills[skill] = clonedNPC.skills[skill] + rollDice(clonedNPC.skillRandomizerDice);
      } else {
        clonedNPC.skills[skill].level = clonedNPC.skills[skill].level + rollDice(clonedNPC.skillRandomizerDice);
      }
    }

    return clonedNPC.skills;
  }

  private async setInitialNPCPositionAsSolid(NPCData: INPCSeedData): Promise<void> {
    try {
      // mark NPC initial position as solid on the map (pathfinding)
      await this.gridManager.setWalkable(NPCData.scene, ToGridX(NPCData.x), ToGridY(NPCData.y), false);
    } catch (error) {
      console.log(
        `❌ Failed to set NPC ${NPCData.key} initial position (${NPCData.x}, ${NPCData.y}) as solid on the map (${NPCData.scene})`
      );

      console.error(error);
    }
  }
}
