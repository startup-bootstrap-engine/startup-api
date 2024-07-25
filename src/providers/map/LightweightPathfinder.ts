import { INPC } from "@entities/ModuleNPC/NPCModel";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { MathHelper } from "@providers/math/MathHelper";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { GRID_WIDTH, ToGridX, ToGridY } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(LightweightPathfinder)
export class LightweightPathfinder {
  constructor(
    private inMemoryHashTable: InMemoryHashTable,
    private mathHelper: MathHelper,
    private movementHelper: MovementHelper
  ) {}

  public async getNearestGridToTarget(npc: INPC, targetX: number, targetY: number): Promise<number[][]> {
    const potentialPositions = [
      { direction: "top", x: npc.x, y: npc.y - GRID_WIDTH },
      { direction: "bottom", x: npc.x, y: npc.y + GRID_WIDTH },
      { direction: "left", x: npc.x - GRID_WIDTH, y: npc.y },
      { direction: "right", x: npc.x + GRID_WIDTH, y: npc.y },
    ];

    const nonSolidPositions = (
      await Promise.all(
        potentialPositions.map(async (position) => ({
          isSolid: await this.movementHelper.isSolid(
            npc.scene,
            ToGridX(position.x),
            ToGridY(position.y),
            npc.layer,
            "CHECK_ALL_LAYERS_BELOW"
          ),
          position,
        }))
      )
    )
      .filter((result) => !result.isSolid)
      .map((result) => result.position);

    const dx = targetX - npc.x;
    const dy = targetY - npc.y;
    const targetDirection = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "bottom" : "top";

    const handleNPCStuck = async (npc: INPC, x: number, y: number): Promise<boolean> => {
      const npcId = npc._id.toString();
      const prevPositions = (await this.inMemoryHashTable.get("npc-positions", npcId)) || [];

      // Check if the current position is in the previous positions
      const isStuck = prevPositions.some(([prevX, prevY]) => prevX === ToGridX(x) && prevY === ToGridY(y));

      // Update the previous positions
      prevPositions.push([ToGridX(x), ToGridY(y)]);
      if (prevPositions.length > 5) {
        prevPositions.shift(); // Limit the size of the history to the last 5 positions
      }
      await this.inMemoryHashTable.set("npc-positions", npcId, prevPositions);

      return isStuck;
    };

    // eslint-disable-next-line mongoose-lean/require-lean
    const targetDirectionPosition = nonSolidPositions.find((pos) => pos.direction === targetDirection);

    if (targetDirectionPosition) {
      if (await handleNPCStuck(npc, targetDirectionPosition.x, targetDirectionPosition.y)) {
        return [];
      }
      return [[ToGridX(targetDirectionPosition.x), ToGridY(targetDirectionPosition.y)]];
    }

    type PositionWithDistance = { distance: number; direction: string; x: number; y: number };

    const closestPosition = nonSolidPositions.reduce<PositionWithDistance>(
      (closest, position) => {
        const distance = this.mathHelper.getDistanceBetweenPoints(position.x, position.y, targetX, targetY);
        return distance < closest.distance ? { ...position, distance } : closest;
      },
      { distance: Infinity, direction: "", x: 0, y: 0 }
    );

    if (closestPosition.distance < Infinity) {
      if (await handleNPCStuck(npc, closestPosition.x, closestPosition.y)) {
        return [];
      }
      return [[ToGridX(closestPosition.x), ToGridY(closestPosition.y)]];
    }

    return [];
  }
}
