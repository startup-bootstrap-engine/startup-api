import { ScenesMetaData } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { ITiledObject } from "./MapLoader";

@provide(MapHelper)
export class MapHelper {
  public getSceneNameFromMapName(mapName: string): string | undefined {
    for (const [scene, data] of Object.entries(ScenesMetaData)) {
      if (data.map === mapName) {
        return scene;
      }
    }
  }

  public mergeBlueprintWithTiledProps<T>(
    tiledData: ITiledObject,
    mapName: string,
    blueprintIndex: Record<string, any>,
    additionalProperties: Record<string, any> | null,
    elementType: "npc" | "item"
  ): { key: string; data: T } {
    const tiledProperties: Record<string, any> = {};

    tiledData.properties.forEach((property) => {
      tiledProperties[property.name] = property.value;
    });

    const baseKey = `${tiledProperties.key.replace(`${elementType}-`, "")}`;
    const blueprint = blueprintIndex[baseKey];
    const key = `${baseKey}-${tiledData.id}`;

    const sceneName = this.getSceneNameFromMapName(mapName);

    if (!sceneName) {
      throw new Error(`NPCLoader: Scene name is not found for map ${mapName}`);
    }

    const data = {
      ...blueprint,
      ...tiledProperties,
      ...additionalProperties,
      tiledId: tiledData.id,
      blueprintIndex: baseKey,
      x: tiledData.x,
      y: tiledData.y,
      scene: sceneName,
      key,
    };

    return { key, data };
  }
}
