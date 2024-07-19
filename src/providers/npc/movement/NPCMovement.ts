import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterView } from "@providers/character/CharacterView";
import { appEnv } from "@providers/config/env";
import { NPC_CAN_ATTACK_IN_NON_PVP_ZONE } from "@providers/constants/NPCConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { GridManager } from "@providers/map/GridManager";
import { MapNonPVPZone } from "@providers/map/MapNonPVPZone";
import { Pathfinder } from "@providers/map/Pathfinder";
import { PathfindingQueue } from "@providers/map/PathfindingQueue";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { Stealth } from "@providers/spells/data/logic/rogue/Stealth";
import { INPCPositionUpdatePayload, NPCAlignment, NPCSocketEvents, ToGridX, ToGridY } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { NPCView } from "../NPCView";
import { NPCWarn } from "../NPCWarn";
import { NPCTarget } from "./NPCTarget";

export type NPCDirection = "up" | "down" | "left" | "right";

interface IShortestPathPositionResult {
  newGridX: number;
  newGridY: number;
  nextMovementDirection: NPCDirection;
}

@provide(NPCMovement)
export class NPCMovement {
  constructor(
    private socketMessaging: SocketMessaging,
    private npcView: NPCView,
    private movementHelper: MovementHelper,
    private gridManager: GridManager,
    private mapNonPVPZone: MapNonPVPZone,
    private npcTarget: NPCTarget,
    private characterView: CharacterView,
    private npcWarn: NPCWarn,
    private stealth: Stealth,
    private inMemoryHashTable: InMemoryHashTable,
    private pathfindingQueue: PathfindingQueue,
    private pathfinder: Pathfinder
  ) {}

  public isNPCAtPathPosition(npc: INPC, gridX: number, gridY: number): boolean {
    if (ToGridX(npc.x) === gridX && ToGridY(npc.y) === gridY) {
      return true;
    }

    return false;
  }

  @TrackNewRelicTransaction()
  public async moveNPC(
    npc: INPC,
    oldX: number,
    oldY: number,
    newX: number,
    newY: number,
    chosenMovementDirection: NPCDirection
  ): Promise<boolean> {
    try {
      const map = npc.scene;
      const [newGridX, newGridY] = [ToGridX(newX), ToGridY(newY)];
      const [oldGridX, oldGridY] = [ToGridX(oldX), ToGridY(oldY)];

      // Store previous npc position.
      await this.inMemoryHashTable.set("npc-previous-position", npc.id, [oldGridX, oldGridY]);

      // Check if max range is reached
      const hasSolid = await this.movementHelper.isSolid(
        map,
        newGridX,
        newGridY,
        npc.layer,
        "CHECK_ALL_LAYERS_BELOW",
        npc
      );

      if (hasSolid) {
        await this.gridManager.setWalkable(map, newGridX, newGridY, false);
        return false;
      }

      await Promise.all([
        this.gridManager.setWalkable(map, oldGridX, oldGridY, true),
        this.gridManager.setWalkable(map, newGridX, newGridY, false),
      ]);

      // Warn nearby characters that the NPC moved
      const nearbyCharacters = await this.npcView.getCharactersInView(npc);

      let canUpdateNPC = true;

      const characterUpdates = nearbyCharacters.map(async (character) => {
        let clearTarget = false;
        const isRaid = npc.raidKey !== undefined;
        const freeze = !isRaid;

        if (!NPC_CAN_ATTACK_IN_NON_PVP_ZONE && freeze) {
          const isCharInNonPVPZone = this.mapNonPVPZone.isNonPVPZoneAtXY(character.scene, character.x, character.y);

          if (isCharInNonPVPZone && npc.alignment === NPCAlignment.Hostile) {
            clearTarget = true;
          }
        }

        const isTargetInvisible = await this.stealth.isInvisible(character);

        if (isTargetInvisible) {
          canUpdateNPC = false;
          return;
        }

        if (clearTarget) {
          await this.npcTarget.clearTarget(npc);
        }

        const isOnCharView = await this.characterView.isOnCharacterView(character._id, npc._id, "npcs");

        if (!isOnCharView) {
          await this.npcWarn.warnCharacterAboutSingleNPCCreation(npc, character);
        } else {
          this.socketMessaging.sendEventToUser<INPCPositionUpdatePayload>(
            character.channelId!,
            NPCSocketEvents.NPCPositionUpdate,
            {
              id: npc._id,
              x: npc.x,
              y: npc.y,
              direction: chosenMovementDirection,
              alignment: npc.alignment as NPCAlignment,
            }
          );
        }
      });

      await Promise.all(characterUpdates);

      if (canUpdateNPC) {
        await NPC.updateOne({ _id: npc._id }, { x: newX, y: newY, direction: chosenMovementDirection });
      }

      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @TrackNewRelicTransaction()
  public async getShortestPathNextPosition(
    npc: INPC,
    target: ICharacter | null,
    startGridX: number,
    startGridY: number,
    endGridX: number,
    endGridY: number
  ): Promise<IShortestPathPositionResult | undefined> {
    try {
      let npcPath;
      if (appEnv.general.IS_UNIT_TEST) {
        npcPath = await this.pathfinder.findShortestPath(
          npc,
          target,
          npc.scene,
          startGridX,
          startGridY,
          endGridX,
          endGridY
        );
      } else {
        npcPath = await this.pathfindingQueue.findPathForNPC(
          npc,

          target,
          startGridX,
          startGridY,
          endGridX,
          endGridY
        );
        if (!npcPath?.length) {
          return;
        }
      }

      // get first next available position
      const [newGridX, newGridY] = npcPath[1] ?? npcPath[0]; // 0 would be the cached path. Remember that we store only the next step on the cache.

      if (!newGridX || !newGridY) {
        return;
      }

      const nextMovementDirection = this.movementHelper.getGridMovementDirection(
        ToGridX(npc.x),
        ToGridY(npc.y),
        newGridX,
        newGridY
      );

      if (!nextMovementDirection) {
        return;
        // throw new Error(`Failed to calculate nextMovement for NPC ${npc.key}`);
      }

      return {
        newGridX,
        newGridY,
        nextMovementDirection,
      };
    } catch (error) {
      console.error(`❌ Error while trying to move NPC key: ${npc.key} at ${npc.x}, ${npc.y} - map ${npc.scene}`);
      console.error(error);
      throw error;
    }
  }
}
