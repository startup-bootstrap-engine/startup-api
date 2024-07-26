import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterView } from "@providers/character/CharacterView";
import { InMemoryRepository } from "@providers/database/InMemoryRepository";
import { Locker } from "@providers/locks/Locker";
import { MathHelper } from "@providers/math/MathHelper";
import { GRID_WIDTH } from "@rpg-engine/shared";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";
import { NPCGiantForm } from "./NPCGiantForm";
import { NPCHealthManaCalculator } from "./NPCHealthManaCalculator";
import { NPCWarn } from "./NPCWarn";
import { NPCTarget } from "./movement/NPCTarget";

@provide(NPCSpawn)
export class NPCSpawn {
  constructor(
    private characterView: CharacterView,
    private mathHelper: MathHelper,
    private npcTarget: NPCTarget,
    private npcWarn: NPCWarn,
    private npcGiantForm: NPCGiantForm,
    private locker: Locker,
    private inMemoryHashTable: InMemoryRepository,
    private npcHealthManaCalculator: NPCHealthManaCalculator
  ) {}

  public calculateSpawnTime(strengthLevel: number): Date {
    try {
      if (typeof strengthLevel !== "number" || strengthLevel < 0) {
        return dayjs(new Date()).add(1, "minutes").toDate(); // Default to 1 minute if strengthLevel is not a number or negative
      }

      let spawnTime = Math.round(strengthLevel / 10);
      spawnTime = Math.max(1, spawnTime); // ensure it's at least 1
      spawnTime = Math.min(3, spawnTime); // ensure it's at most 3

      return dayjs(new Date()).add(spawnTime, "minutes").toDate();
    } catch (error) {
      // If any error occurs, default to 1 minute
      return dayjs(new Date()).add(1, "minutes").toDate();
    }
  }

  @TrackNewRelicTransaction()
  public async spawn(npc: INPC, isRaid?: boolean): Promise<void> {
    try {
      if (!isRaid && !(await this.canSpawn(npc))) {
        return;
      }

      await this.npcTarget.clearTarget(npc);

      const maxHealth = this.npcHealthManaCalculator.getNPCMaxHealthRandomized(npc);

      await NPC.updateOne(
        { _id: npc._id },
        {
          $set: {
            health: maxHealth,
            maxHealth,
            mana: npc.maxMana,
            appliedEntityEffects: [],
            x: npc.initialX,
            y: npc.initialY,
            isBehaviorEnabled: false,
          },
          $unset: {
            nextSpawnTime: "",
          },
        }
      );

      await this.npcGiantForm.resetNPCToNormalForm(npc);
      await this.npcGiantForm.randomlyTransformNPCIntoGiantForm(npc);

      const nearbyCharacters = await this.characterView.getCharactersAroundXYPosition(npc.x, npc.y, npc.scene);

      for (const nearbyCharacter of nearbyCharacters) {
        await this.npcWarn.warnCharacterAboutNPCsInView(nearbyCharacter, {
          always: true,
        });
      }
    } finally {
      // Unlock and delete operations are placed in the finally block to ensure they are always executed
      await Promise.all([
        this.locker.unlock(`npc-death-${npc._id}`),
        this.locker.unlock(`npc-body-generation-${npc._id}`),
        this.locker.unlock(`npc-${npc._id}-release-xp`),
        this.inMemoryHashTable.delete("npc-force-pathfinding-calculation", npc._id),
        this.inMemoryHashTable.delete("npc-positions", npc._id),
        this.inMemoryHashTable.delete("npc-prev-position", npc._id),
        this.inMemoryHashTable.delete("npc-stationary-count", npc._id),
      ]);
    }
  }

  private async canSpawn(npc: INPC): Promise<boolean> {
    // check distance to nearest character. If too close, lets abort the spawn!

    const nearestCharacter = await this.characterView.getNearestCharactersFromXYPoint(
      npc.initialX,
      npc.initialY,
      npc.scene
    );

    if (!nearestCharacter) {
      return true;
    }

    const distanceToNearChar = this.mathHelper.getDistanceBetweenPoints(
      npc.x,
      npc.y,
      nearestCharacter.x,
      nearestCharacter.y
    );

    const distanceInGrid = Math.floor(distanceToNearChar / GRID_WIDTH);

    if (distanceInGrid < 20) {
      return false;
    }

    return true;
  }
}
