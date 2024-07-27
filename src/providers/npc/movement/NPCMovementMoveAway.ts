import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { MathHelper } from "@providers/math/MathHelper";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { AnimationDirection, MapLayers, ToGridX, ToGridY } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { NPCMovement } from "./NPCMovement";
import { NPCTarget } from "./NPCTarget";

const DIRECTIONS = ["up", "down", "left", "right"] as const;

@provide(NPCMovementMoveAway)
export class NPCMovementMoveAway {
  constructor(
    private npcMovement: NPCMovement,
    private npcTarget: NPCTarget,
    private movementHelper: MovementHelper,
    private mathHelper: MathHelper
  ) {}

  @TrackNewRelicTransaction()
  public async startMovementMoveAway(npc: INPC): Promise<void> {
    try {
      const targetCharacter = (await Character.findById(npc.targetCharacter).lean()) as ICharacter;

      if (!targetCharacter) {
        await this.npcTarget.tryToSetTarget(npc);
        return;
      }

      await this.npcTarget.tryToClearOutOfRangeTargets(npc);

      const targetDirection = this.npcTarget.getTargetDirection(npc, targetCharacter.x, targetCharacter.y);
      const oppositeTargetDirection = this.movementHelper.getOppositeDirection(targetDirection as AnimationDirection);

      let { x: newX, y: newY } = this.movementHelper.calculateNewPositionXY(npc.x, npc.y, oppositeTargetDirection);

      let hasSolid = await this.movementHelper.isSolid(npc.scene, ToGridX(newX), ToGridY(newY), MapLayers.Character);

      let alternativeDirection: AnimationDirection | undefined;
      if (hasSolid) {
        ({ newX, newY, alternativeDirection } = await this.findAlternativeDirection(npc, targetCharacter, newX, newY));
        hasSolid = await this.movementHelper.isSolid(npc.scene, ToGridX(newX), ToGridY(newY), MapLayers.Character);
      }

      if (!hasSolid && this.movementHelper.isUnderRange(npc.x, npc.y, newX, newY, npc.maxRangeInGridCells!)) {
        await this.npcMovement.moveNPC(npc, npc.x, npc.y, newX, newY, alternativeDirection ?? oppositeTargetDirection);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async findAlternativeDirection(
    npc: INPC,
    targetCharacter: ICharacter,
    newX: number,
    newY: number
  ): Promise<{ newX: number; newY: number; alternativeDirection: AnimationDirection | undefined }> {
    let maxDistance = 0;
    let alternativeDirection: AnimationDirection | undefined;

    for (const direction of DIRECTIONS) {
      const { x: tempX, y: tempY } = this.movementHelper.calculateNewPositionXY(npc.x, npc.y, direction);
      const hasSolid = await this.movementHelper.isSolid(
        npc.scene,
        ToGridX(tempX),
        ToGridY(tempY),
        MapLayers.Character
      );

      if (!hasSolid) {
        const distance = this.mathHelper.getDistanceBetweenPoints(targetCharacter.x, targetCharacter.y, tempX, tempY);
        const isWithinRange = this.movementHelper.isUnderRange(npc.x, npc.y, tempX, tempY, npc.maxRangeInGridCells!);

        if (distance > maxDistance && isWithinRange) {
          maxDistance = distance;
          newX = tempX;
          newY = tempY;
          alternativeDirection = direction;
        }
      }
    }

    return { newX, newY, alternativeDirection };
  }
}
