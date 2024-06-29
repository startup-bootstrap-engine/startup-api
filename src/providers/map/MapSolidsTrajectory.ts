import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { MathHelper } from "@providers/math/MathHelper";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { IItem, MapLayers, ToGridX, ToGridY } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import _ from "lodash";

@provide(MapSolidsTrajectory)
export class MapSolidsTrajectory {
  constructor(private movementHelper: MovementHelper, private mathHelper: MathHelper) {}

  public async isSolidInTrajectory(attacker: ICharacter | INPC, target: ICharacter | INPC | IItem): Promise<boolean> {
    if (typeof target.x === "undefined" || typeof target.y === "undefined") {
      return false;
    }
    const origin = { x: ToGridX(attacker.x), y: ToGridY(attacker.y) };
    const destination = { x: ToGridX(target.x), y: ToGridY(target.y) };

    const crossedGridPoints = this.mathHelper.getCrossedGridPoints(origin, destination);

    for (const point of crossedGridPoints) {
      if (_.isEqual(point, origin) || _.isEqual(point, destination)) {
        continue;
      }
      const isSolid = await this.movementHelper.isSolid(attacker.scene, point.x, point.y, MapLayers.Character);
      if (isSolid) {
        return true;
      }
    }
    return false;
  }
}
