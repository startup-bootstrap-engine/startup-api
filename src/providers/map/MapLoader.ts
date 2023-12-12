import { MapModel } from "@entities/ModuleSystem/MapModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { UNIT_TESTING_MAPS } from "@providers/constants/MapConstants";
import { STATIC_PATH } from "@providers/constants/PathConstants";
import { InternalServerError } from "@providers/errors/InternalServerError";
import { ITiled, MAP_REQUIRED_LAYERS } from "@rpg-engine/shared";
import fs from "fs";
import { provide } from "inversify-binding-decorators";
import md5File from "md5-file";
import { GridManager } from "./GridManager";
import { createZipMap } from "./MapCompressionHelper";

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
    // get all map names

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

      const updated = !appEnv.general.IS_UNIT_TEST
        ? await this.checkMapUpdated(mapPath, mapFileName, currentMap)
        : true;

      if (updated) {
        mapToCheckTransitions.push({ name: mapFileName, data: currentMap });
      }

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

  private async checkMapUpdated(mapPath: string, mapFileName: string, mapObject: object): Promise<boolean> {
    const mapChecksum = this.checksum(mapPath);
    const fileName = this.extractFileName(mapFileName);
    const mapData = await MapModel.findOne({ name: fileName });

    // Determine if zip file creation is necessary
    const isZipCreationNeeded =
      !this.doesMapHasCorrespondingZipFile(fileName) || (mapData && mapData.checksum !== mapChecksum);

    // Handle new map creation
    if (!mapData) {
      await this.handleNewMapCreation(fileName, mapChecksum, mapObject);
      await this.createZipForMap(fileName, mapObject);
      return true;
    }

    // Update existing map if checksum differs
    const wasMapUpdated = await this.updateExistingMapIfChecksumDiffers(mapData, mapChecksum, fileName);

    // Create or update zip if needed
    if (isZipCreationNeeded || wasMapUpdated) {
      await this.createZipForMap(fileName, mapObject);
    }

    return wasMapUpdated;
  }

  private async updateExistingMapIfChecksumDiffers(
    mapData: any,
    mapChecksum: string,
    fileName: string
  ): Promise<boolean> {
    if (mapData.checksum !== mapChecksum) {
      console.log(`📦 Map ${fileName} is updated!`);
      mapData.checksum = mapChecksum;
      await mapData.save();
      return true;
    }
    return false;
  }

  private doesMapHasCorrespondingZipFile(mapName: string): boolean {
    const zipPath = `${STATIC_PATH}/maps/${mapName}.zip`;
    return fs.existsSync(zipPath);
  }

  private extractFileName(filePath: string): string {
    return filePath.replace(".json", "");
  }

  private async handleNewMapCreation(fileName: string, mapChecksum: string, mapObject: object): Promise<boolean> {
    console.log(`📦 Map ${fileName} is created!`);
    await MapModel.create({ name: fileName, checksum: mapChecksum });

    return true;
  }

  private async createZipForMap(fileName: string, mapObject: object): Promise<void> {
    console.log("📦 Creating zip for map...", fileName);
    const pathToSave = `${STATIC_PATH}/maps`;
    await createZipMap(fileName, mapObject, pathToSave);
  }

  public checksum(path): string {
    return md5File.sync(path);
  }
}
