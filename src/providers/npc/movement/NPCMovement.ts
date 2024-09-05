import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterView } from "@providers/character/CharacterView";
import { NPC_CAN_ATTACK_IN_NON_PVP_ZONE } from "@providers/constants/NPCConstants";
import { GridManager } from "@providers/map/GridManager";
import { MapNonPVPZone } from "@providers/map/MapNonPVPZone";
import { Pathfinding } from "@providers/map/pathfinding/Pathfinding";
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
    private pathfindingQueue: Pathfinding
  ) {}

  public isNPCAtPathPosition(npc: INPC, gridX: number, gridY: number): boolean {
    return ToGridX(npc.x) === gridX && ToGridY(npc.y) === gridY;
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
      const [newGridX, newGridY] = this.convertToGrid(newX, newY);
      const [oldGridX, oldGridY] = this.convertToGrid(oldX, oldY);

      if (await this.isDestinationSolid(npc, newGridX, newGridY)) {
        return false;
      }

      await this.updateGridWalkability(npc.scene, oldGridX, oldGridY, newGridX, newGridY);

      const canUpdateNPC = await this.handleNearbyCharacters(npc, chosenMovementDirection);

      if (canUpdateNPC) {
        await this.updateNPCInDatabase(npc, newX, newY, chosenMovementDirection);
      }

      return true;
    } catch (error) {
      console.error(`Error moving NPC ${npc.key}:`, error);
      throw error;
    }
  }

  @TrackNewRelicTransaction()
  public async deprecatedGetShortedPathNextPosition(
    npc: INPC,
    target: ICharacter | null,
    startGridX: number,
    startGridY: number,
    endGridX: number,
    endGridY: number
  ): Promise<IShortestPathPositionResult | undefined> {
    //! Deprecated, but not removed because unit tests still rely on it.
    try {
      const npcPath = await this.pathfindingQueue.deprecatedFindShortedPath(
        npc,
        target,
        npc.scene,
        startGridX,
        startGridY,
        endGridX,
        endGridY
      );

      return this.calculateNextPosition(npc, npcPath);
    } catch (error) {
      console.error(`Error finding path for NPC ${npc.key}:`, error);
      throw error;
    }
  }

  public calculateNextPosition(npc: INPC, npcPath: number[][] | undefined): IShortestPathPositionResult | undefined {
    if (!npcPath?.length) return;

    const [newGridX, newGridY] = npcPath[1] ?? npcPath[0];
    if (!newGridX || !newGridY) return;

    const nextMovementDirection = this.movementHelper.getGridMovementDirection(
      ToGridX(npc.x),
      ToGridY(npc.y),
      newGridX,
      newGridY
    );
    if (!nextMovementDirection) return;

    return { newGridX, newGridY, nextMovementDirection };
  }

  private async isDestinationSolid(npc: INPC, newGridX: number, newGridY: number): Promise<boolean> {
    const hasSolid = await this.movementHelper.isSolid(
      npc.scene,
      newGridX,
      newGridY,
      npc.layer,
      "CHECK_ALL_LAYERS_BELOW",
      npc
    );

    await this.gridManager.setWalkable(npc.scene, newGridX, newGridY, !hasSolid);
    return hasSolid;
  }

  private async updateGridWalkability(
    map: string,
    oldGridX: number,
    oldGridY: number,
    newGridX: number,
    newGridY: number
  ): Promise<void> {
    await this.gridManager.setWalkable(map, oldGridX, oldGridY, true);
    await this.gridManager.setWalkable(map, newGridX, newGridY, false);
  }

  private async handleNearbyCharacters(npc: INPC, chosenMovementDirection: NPCDirection): Promise<boolean> {
    const nearbyCharacters = await this.npcView.getCharactersInView(npc);
    let canUpdateNPC = true;

    for (const character of nearbyCharacters) {
      if (await this.stealth.isInvisible(character)) {
        canUpdateNPC = false;
        continue;
      }

      await this.handleCharacterInteraction(npc, character, chosenMovementDirection);
    }

    return canUpdateNPC;
  }

  private async handleCharacterInteraction(
    npc: INPC,
    character: ICharacter,
    chosenMovementDirection: NPCDirection
  ): Promise<void> {
    if (await this.shouldClearTarget(npc, character)) {
      console.log(`Clearing ${npc.key} target: handling character interaction with ${character._id}`);
      await this.npcTarget.clearTarget(npc);
    }

    if (!(await this.characterView.isOnCharacterView(character._id, npc._id, "npcs"))) {
      await this.npcWarn.warnCharacterAboutSingleNPCCreation(npc, character);
    } else {
      this.sendNPCPositionUpdate(npc, character, chosenMovementDirection);
    }
  }

  private async shouldClearTarget(npc: INPC, character: ICharacter): Promise<boolean> {
    if (!NPC_CAN_ATTACK_IN_NON_PVP_ZONE && npc.raidKey === undefined) {
      const isCharInNonPVPZone = this.mapNonPVPZone.isNonPVPZoneAtXY(character.scene, character.x, character.y);
      if (isCharInNonPVPZone && npc.alignment === NPCAlignment.Hostile) {
        return true;
      }
    }

    return await this.stealth.isInvisible(character);
  }

  private sendNPCPositionUpdate(npc: INPC, character: ICharacter, chosenMovementDirection: NPCDirection): void {
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

  private async updateNPCInDatabase(
    npc: INPC,
    newX: number,
    newY: number,
    chosenMovementDirection: NPCDirection
  ): Promise<void> {
    await NPC.updateOne({ _id: npc._id }, { x: newX, y: newY, direction: chosenMovementDirection });
  }

  private convertToGrid(x: number, y: number): [number, number] {
    return [ToGridX(x), ToGridY(y)];
  }
}
