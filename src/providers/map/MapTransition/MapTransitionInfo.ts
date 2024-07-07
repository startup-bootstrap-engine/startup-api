import { MAP_TRANSITION_SOCIAL_CRYSTAL_REQUIREMENT } from "@providers/constants/MarketingReferralConstants";
import { ITiledObject } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { MapLoader } from "../MapLoader";
import { MapObjectsLoader } from "../MapObjectsLoader";

@provide(MapTransitionInfo)
export class MapTransitionInfo {
  constructor(private mapObjectsLoader: MapObjectsLoader) {}

  public getTransitionSocialCrystalPrice(mapName: string): number {
    return MAP_TRANSITION_SOCIAL_CRYSTAL_REQUIREMENT[mapName] || 0;
  }

  public getTransitionAtXY(mapName: string, x: number, y: number): ITiledObject | undefined {
    try {
      const map = MapLoader.maps.get(mapName);

      if (!map) {
        throw new Error(`MapTransition: Map "${mapName}" is not found!`);
      }

      const transitions = this.mapObjectsLoader.getObjectLayerData("Transitions", map);

      if (!transitions) {
        return;
      }

      const sameXTransitions = transitions.filter((transition) => transition.x === x);

      if (sameXTransitions) {
        // eslint-disable-next-line mongoose-lean/require-lean
        const transition = sameXTransitions.find((transition) => {
          return transition.y === y;
        });
        return transition;
      }
    } catch (error) {
      console.error(error);
    }
  }

  public getTransitionProperty(transition: ITiledObject, propertyName: string): string | undefined {
    const property = transition.properties.find((property) => property.name === propertyName);

    if (property) {
      return property.value;
    }
  }
}
