/* eslint-disable mongoose-lean/require-lean */
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
  private npcSeedData: Map<string, INPCSeedData>;

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
    this.npcSeedData = await this.npcLoader.loadNPCSeedData();
    const npcDataArray = Array.from(this.npcSeedData.values());
    const existingNPCs = await this.fetchExistingNPCs(npcDataArray);

    const npcPromises = npcDataArray.map((NPCData) => {
      const npcFound = this.findExistingNPC(existingNPCs, NPCData);
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

    // note that not all NPC has blueprint skills. Friendly ones do not need this info specified on the blueprint, although they do have skills on the database
    if (npcBlueprintSkills) {
      if (!cachedNPCSkills || !_.isMatch(cachedNPCSkills, npcBlueprintSkills)) {
        await clearCacheForKey(`${npcFound._id}-skills`);

        // If no skills are found, create new skills from the blueprint
        if (!npcFound.skills) {
          await this.createSkillsFromBlueprint(npcFound, npcBlueprintSkills);
        } else {
          // Update existing skills in the database
          const blueprintSkills = this.createBlueprintSkills(npcBlueprintSkills);
          await Skill.findOneAndUpdate({ _id: npcFound.skills }, { $set: blueprintSkills }, { new: true })
            .lean()
            .cacheQuery({ cacheKey: `${npcFound._id}-skills` });
          console.log(`⚠️ Updated skills for NPC ${npcFound.key}`);

          if (npcFound.isGiantForm) {
            await this.npcGiantForm.setNormalFormStats(npcFound, blueprintSkills as ISkill);
          }
        }
      }
    }
  }

  private async createSkillsFromBlueprint(npcFound: INPC, npcBlueprintSkills: ISkill): Promise<void> {
    const blueprintSkills = this.createBlueprintSkills(npcBlueprintSkills);

    const newSkills = new Skill({
      ...blueprintSkills,
      owner: npcFound._id,
      ownerType: "NPC",
    });

    await newSkills.save();
    npcFound.skills = newSkills._id;
    await npcFound.save();

    if (npcFound.isGiantForm) {
      await this.npcGiantForm.setNormalFormStats(npcFound, blueprintSkills as ISkill);
    }
    console.log(`⚠️ Created new skills for NPC ${npcFound.key}`);
  }

  private createBlueprintSkills(npcBlueprintSkills: ISkill): Partial<ISkill> {
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

      // Get the initial position from npcSeedData
      const seedData = this.findSeedDataForNPC(npc);
      const initialX = seedData ? seedData.initialX : npc.initialX;
      const initialY = seedData ? seedData.initialY : npc.initialY;

      const updateParams = {
        health: randomMaxHealth,
        maxHealth: randomMaxHealth,
        mana: npc.maxMana,
        x: initialX,
        y: initialY,
        currentMovementType: npc.originalMovementType,
        xpToRelease: [],
        isBehaviorEnabled: false,
      } as any;

      await NPC.updateOne(
        { _id: npc._id },
        {
          $set: updateParams,
          $unset: {
            nextSpawnTime: "",
            targetCharacter: "",
          },
        }
      ).lean();

      // Ensure the position is marked as solid in the grid
      await this.gridManager.setWalkable(npc.scene, ToGridX(initialX), ToGridY(initialY), false);
    } catch (error) {
      console.log(`❌ Failed to reset NPC ${npc.key}`);
      console.error(error);
    }
  }

  private findSeedDataForNPC(npc: INPC): INPCSeedData | undefined {
    for (const [key, seedData] of this.npcSeedData.entries()) {
      if (seedData.scene === npc.scene && seedData.tiledId === npc.tiledId) {
        return seedData;
      }
    }
    return undefined;
  }

  private async createNewNPCWithSkills(NPCData: INPCSeedData): Promise<void> {
    try {
      const skills = new Skill({
        ...(this.setNPCRandomSkillLevel(NPCData) as unknown as ISkill),
        ownerType: "NPC",
      });

      // Apply multipliers
      if (skills.level) skills.level *= NPC_SKILL_LEVEL_MULTIPLIER;
      if (skills.strength?.level) skills.strength.level *= NPC_SKILL_STRENGTH_MULTIPLIER;
      if (skills.dexterity?.level) skills.dexterity.level *= NPC_SKILL_DEXTERITY_MULTIPLIER;
      if (skills.resistance?.level) skills.resistance.level *= NPC_SKILL_DEXTERITY_MULTIPLIER;

      // Save the skills
      await skills.save();

      const npcHealth = this.npcHealthManaCalculator.getNPCMaxHealthRandomized(NPCData as unknown as INPC);

      const newNPC = new NPC({
        ...NPCData,
        health: npcHealth,
        maxHealth: npcHealth,
        skills: skills._id,
        isBehaviorEnabled: false,
      });

      await newNPC.save();

      // Update skills owner reference
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
}
