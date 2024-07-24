import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { MapNonPVPZone } from "@providers/map/MapNonPVPZone";
import { MapSolids, SolidCheckStrategy } from "@providers/map/MapSolids";
import { MapTransitionInfo } from "@providers/map/MapTransition/MapTransitionInfo";

import { MathHelper } from "@providers/math/MathHelper";
import {
  AnimationDirection,
  FromGridX,
  FromGridY,
  GRID_WIDTH,
  MapLayers,
  ToGridX,
  ToGridY,
  calculateNewPositionXY,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
export interface IPosition {
  x: number;
  y: number;
}

@provide(MovementHelper)
export class MovementHelper {
  constructor(
    private mathHelper: MathHelper,
    private mapSolids: MapSolids,
    private mapTransitionInfo: MapTransitionInfo,
    private mapNonPVPZone: MapNonPVPZone
  ) {}

  public isSnappedToGrid(x: number, y: number): boolean {
    return x % GRID_WIDTH === 0 && y % GRID_WIDTH === 0;
  }

  @TrackNewRelicTransaction()
  public async isSolid(
    map: string,
    gridX: number,
    gridY: number,
    layer: MapLayers,
    strategy: SolidCheckStrategy = "CHECK_ALL_LAYERS_BELOW",
    caller: INPC | ICharacter | undefined = undefined
  ): Promise<boolean> {
    // check for characters and NPCs

    const hasSolid = this.mapSolids.isTileSolid(map, gridX, gridY, layer, strategy);
    const isPassage = this.mapSolids.isTilePassage(map, gridX, gridY, layer, strategy);

    if (hasSolid && !isPassage) {
      return true;
    }

    if (caller?.type === "NPC") {
      const hasTransition = this.mapTransitionInfo.getTransitionAtXY(map, FromGridX(gridX), FromGridY(gridY));

      if (hasTransition) {
        return true;
      }

      const hasNPC = await NPC.exists({
        x: FromGridX(gridX),
        y: FromGridY(gridY),
        layer,
        health: { $gt: 0 },
        scene: map,
      });

      if (hasNPC) {
        return true;
      }
    }

    // const hasNPC = await NPC.exists({
    //   x: FromGridX(gridX),
    //   y: FromGridY(gridY),
    //   layer,
    //   health: { $gt: 0 },
    //   scene: map,
    // });

    // if (hasNPC) {
    //   return true;
    // }

    // const hasCharacter = await Character.exists({
    //   x: FromGridX(gridX),
    //   y: FromGridY(gridY),
    //   isOnline: true,
    //   layer,
    //   scene: map,
    // });

    // if (hasCharacter) {
    //   return true;
    // }

    // const hasItem = await Item.exists({
    //   x: FromGridX(gridX),
    //   y: FromGridY(gridY),
    //   isSolid: true,
    //   scene: map,
    // });

    // if (hasItem) {
    //   return true;
    // }

    return false;
  }

  public isMoving(startX: number, startY: number, endX: number, endY: number): boolean {
    const xDiff = endX - startX;
    const yDiff = endY - startY;

    if (xDiff === 0 && yDiff === 0) {
      return false;
    }

    return true;
  }

  public getGridMovementDirection(
    startGridX: number,
    startGridY: number,
    endGridX: number,
    endGridY: number
  ): AnimationDirection {
    const Xdiff = endGridX - startGridX;
    const Ydiff = endGridY - startGridY;

    // Calculate absolute differences
    const absXdiff = Math.abs(Xdiff);
    const absYdiff = Math.abs(Ydiff);

    // Determine predominant direction
    if (absXdiff > absYdiff) {
      // Horizontal movement is predominant
      return Xdiff > 0 ? "right" : "left";
    } else if (absYdiff > absXdiff) {
      // Vertical movement is predominant
      return Ydiff > 0 ? "down" : "up";
    } else {
      // Equal horizontal and vertical movement, or no movement
      if (Xdiff === 0 && Ydiff === 0) {
        // No movement
        return "down"; // or any default direction you prefer
      } else {
        // Diagonal movement with equal horizontal and vertical components
        // In this case, we'll prioritize vertical direction
        return Ydiff > 0 ? "down" : "up";
      }
    }
  }

  public isUnderRange(
    initialX: number,
    initialY: number,
    newX: number,
    newY: number,
    maxRangeInGridCells: number
  ): boolean {
    const distance = this.mathHelper.getDistanceBetweenPoints(initialX, initialY, newX, newY);

    // convert distance to abs value
    const distanceInGridCells = Math.round(Math.abs(distance / GRID_WIDTH));

    return distanceInGridCells <= maxRangeInGridCells;
  }

  public calculateNewPositionXY(x: number, y: number, moveToDirection: AnimationDirection): IPosition {
    return calculateNewPositionXY(x, y, moveToDirection);
  }

  public getOppositeDirection(direction: AnimationDirection): AnimationDirection {
    switch (direction) {
      case "down":
        return "up";
      case "up":
        return "down";
      case "left":
        return "right";
      case "right":
        return "left";
    }
  }

  /**
   * Get nearby grid points that are free (not solid or with items)
   * @param character character from which nearby grid points will be searched
   * @param pointsAmount amount of grid points to return
   */
  @TrackNewRelicTransaction()
  public async getNearbyGridPoints(character: ICharacter, pointsAmount: number): Promise<IPosition[]> {
    const result: IPosition[] = [];
    const circundatingPoints = this.mathHelper.getCircundatingGridPoints(
      { x: ToGridX(character.x), y: ToGridY(character.y) },
      2
    );
    for (const point of circundatingPoints) {
      const isSolid = await this.isSolid(character.scene, point.x, point.y, character.layer);
      if (!isSolid) {
        result.push(point);
      }
      if (result.length === pointsAmount) {
        break;
      }
    }
    return result;
  }
}
