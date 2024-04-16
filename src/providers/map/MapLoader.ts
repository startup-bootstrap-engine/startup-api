import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { UNIT_TESTING_MAPS } from "@providers/constants/MapConstants";
import { STATIC_PATH } from "@providers/constants/PathConstants";
import { InternalServerError } from "@providers/errors/InternalServerError";
import { ITiled, MAP_REQUIRED_LAYERS } from "@rpg-engine/shared";
import fs from "fs";
import { provide } from "inversify-binding-decorators";
import { GridManager } from "./GridManager";
type MapObject = {
  name: string;
  data: ITiled;
};

@provide(MapLoader)
export class MapLoader {
  public static maps: Map<string, ITiled> = new Map();
  constructor(private gridManager: GridManager) {}

  @TrackNewRelicTransaction()
  public async init(): Promise<void> {
    const mapNames = appEnv.general.IS_UNIT_TEST ? UNIT_TESTING_MAPS : this.getMapNames();
    const mapToCheckTransitions: MapObject[] = [];

    if (!appEnv.general.IS_UNIT_TEST) {
      console.time("🟧 Solids generated in");
    }

    for (const mapFileName of mapNames) {
      if (mapFileName.includes("_hash")) {
        continue; // just cache files, skip!
      }

      if (!mapFileName.endsWith(".json")) {
        continue;
      }

      const mapPath = `${STATIC_PATH}/maps/${mapFileName}`;
      const currentMap = JSON.parse(fs.readFileSync(mapPath, "utf8")) as unknown as ITiled;

      if (currentMap) {
        this.hasMapRequiredLayers(mapFileName, currentMap as ITiled);
      }

      mapToCheckTransitions.push({ name: mapFileName, data: currentMap });

      const mapName = mapFileName.replace(".json", "");

      MapLoader.maps.set(mapName, currentMap);

      await this.gridManager.generateGridSolids(mapName);
    }

    if (!appEnv.general.IS_UNIT_TEST) {
      console.timeEnd("🟧 Solids generated in");

      console.log("📦 Maps and grids are loaded!");
    }
  }

  private getMapNames(): string[] {
    return fs.readdirSync(STATIC_PATH + "/maps");
  }

  private hasMapRequiredLayers(mapName: string, map: ITiled): void {
    const requiredLayers = MAP_REQUIRED_LAYERS;

    const mapLayers = map.layers.map((layer) => layer.name);

    for (const layer of requiredLayers) {
      if (!mapLayers.includes(layer)) {
        throw new InternalServerError(`❌ Map ${mapName} doesn't have required layer: ${layer}`);
      }
    }
  }
}
