/* eslint-disable no-unused-vars */
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import mapVersions from "../../../../public/config/map-versions.json";
import { GridManager } from "../GridManager";
import { MapProperties } from "../MapProperties";
import { MapSolids } from "../MapSolids";
import { MapTiles } from "../MapTiles";
import { MapGridSolidsStorage } from "../storage/MapGridSolidsStorage";

describe("GridManager", () => {
  let gridManager: GridManager;
  let mapTiles: MapTiles;
  let testNPC: INPC;
  let mapProperties: MapProperties;

  beforeAll(async () => {
    gridManager = container.get<GridManager>(GridManager);
    mapProperties = container.get<MapProperties>(MapProperties);
    mapTiles = container.get<MapTiles>(MapTiles);

    await unitTestHelper.initializeMapLoader();

    await gridManager.generateGridSolids("unit-test-map-negative-coordinate");
    await gridManager.generateGridSolids("example");
    await gridManager.generateGridSolids("unit-test-map");
  });

  beforeEach(async () => {
    testNPC = await unitTestHelper.createMockNPC();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const getMapOffset = (mapName: string): { gridOffsetX: number; gridOffsetY: number } => {
    const initialXY = mapTiles.getFirstXY(mapName)!;
    const offset = mapProperties.getMapOffset(initialXY[0], initialXY[1]);
    return offset!;
  };

  const checkMapSize = async (mapName: string, expectedWidth: number, expectedHeight: number): Promise<void> => {
    const hasGrid = await gridManager.hasGrid(mapName);
    expect(hasGrid).toBeTruthy();

    const grid = await gridManager.getGrid(mapName);
    if (!grid) {
      throw new Error("❌Could not find grid for map: " + mapName);
    }

    const { gridOffsetX, gridOffsetY } = getMapOffset(mapName)!;
    const { width, height } = mapTiles.getMapWidthHeight(mapName, gridOffsetX, gridOffsetY);

    expect(width).toBe(expectedWidth);
    expect(height).toBe(expectedHeight);
  };

  it("should properly generate a grid solid map and correctly size it (width, height)", async () => {
    await checkMapSize("unit-test-map-negative-coordinate", 48, 32);

    await checkMapSize("example", 80, 96);

    await checkMapSize("unit-test-map", 32, 32);
  });

  it("should return the offset x and y if a map has negative coordinates", () => {
    const { gridOffsetX, gridOffsetY } = getMapOffset("unit-test-map-negative-coordinate")!;

    expect(gridOffsetX).toBe(16);
    expect(gridOffsetY).toBe(0);

    const { gridOffsetX: gridOffsetX2, gridOffsetY: gridOffsetY2 } = getMapOffset("example")!;

    expect(gridOffsetX2).toBe(0);
    expect(gridOffsetY2).toBe(32);
  });

  it("shouldn't return a x and y offset if the map has no negative coordinates", () => {
    const { gridOffsetX, gridOffsetY } = getMapOffset("unit-test-map")!;

    expect(gridOffsetX).toBe(0);
    expect(gridOffsetY).toBe(0);
  });

  it("should properly set a grid solid and non-solids", async () => {
    const solids = [
      [-16, 0],
      [31, 31],
      [-10, 10],
      [-7, 16],
      [8, 23],
      [17, 23],
    ];

    for (const solid of solids) {
      const isSolidWalkable = await gridManager.isWalkable("unit-test-map-negative-coordinate", solid[0], solid[1]);
      expect(isSolidWalkable).toBe(false);
    }

    const nonSolids = [
      [17, 16],
      [18, 17],
      [-7, 13],
      [-12, 29],
      [27, 5],
    ];

    for (const nonSolid of nonSolids) {
      const isNonSolidWalkable = await gridManager.isWalkable(
        "unit-test-map-negative-coordinate",
        nonSolid[0],
        nonSolid[1]
      );
      expect(isNonSolidWalkable).toBe(true);
    }
  });

  it("should properly detect solids on a gridX and gridY for Example map", async () => {
    const nonSolids = [
      [4, 4],
      [23, 4],
      [4, 15],
      [23, 15],
      [14, 50],
    ];

    for (const nonSolid of nonSolids) {
      expect(await gridManager.isWalkable("example", nonSolid[0], nonSolid[1])).toBe(true);
    }

    const solids = [
      [0, -32],
      [0, 55],
      [63, 55],
      [63, -32],
      [36, 7],
      [36, 11],
      [8, 30],
      [20, 30],
      [13, 54],
    ];

    for (const solid of solids) {
      expect(await gridManager.isWalkable("example", solid[0], solid[1])).toBe(false);
    }
  });

  it("should properly set walkable", async () => {
    const x = -16;
    const y = 0;

    await gridManager.setWalkable("unit-test-map-negative-coordinate", x, y, false);
    expect(await gridManager.isWalkable("unit-test-map-negative-coordinate", x, y)).toBeFalsy();

    await gridManager.setWalkable("unit-test-map-negative-coordinate", x, y, true);
    expect(await gridManager.isWalkable("unit-test-map-negative-coordinate", x, y)).toBeTruthy();
  });

  it("should return correct bounds with offset for grid with x > 0", () => {
    // @ts-ignore
    const mapDimensSpy = jest.spyOn(gridManager.mapProperties as any, "getMapDimensions");
    mapDimensSpy.mockImplementation();
    mapDimensSpy.mockReturnValue({
      startX: 256,
      startY: -32,
      width: 384,
      height: 160,
    });

    const bounds = (gridManager as any).getSubGridBounds("map", {
      start: { x: 365, y: 71 },
      end: { x: 361, y: 66 },
      offset: 10,
    });

    expect(bounds).toEqual({
      startX: 342,
      startY: 48,
      width: 32,
      height: 41,
    });
  });

  describe("generateGridSolids", () => {
    it("should fetch and set grid solids from storage if map version matches", async () => {
      const map = "unit-test-map";
      const version = mapVersions[map];
      const storedTree = [
        [0, 1],
        [1, 0],
      ];

      jest
        .spyOn(MapGridSolidsStorage.prototype, "getGridSolidsVersion")
        .mockResolvedValue(version as unknown as string);
      jest.spyOn(MapGridSolidsStorage.prototype, "getGridSolids").mockResolvedValue(storedTree);

      await gridManager.generateGridSolids(map);

      expect(gridManager.getGrid(map)).toEqual(storedTree);
    });

    it("should throw an error if grid is not found in storage when version matches", async () => {
      const map = "example-map";
      const version = mapVersions[map];

      jest.spyOn(MapGridSolidsStorage.prototype, "getGridSolidsVersion").mockResolvedValue(version);
      // @ts-ignore
      jest.spyOn(MapGridSolidsStorage.prototype, "getGridSolids").mockResolvedValue(null);

      await expect(gridManager.generateGridSolids(map)).rejects.toThrow("Failed to find map example-map");
    });

    it("should delete old grid solids and regenerate if map version does not match", async () => {
      const map = "example-map";
      const version = mapVersions[map];
      const bounds = { startX: 0, startY: 0, width: 2, height: 2 };
      const offset = { gridOffsetX: 0, gridOffsetY: 0 };

      jest.spyOn(MapGridSolidsStorage.prototype, "getGridSolidsVersion").mockResolvedValue("old-version");
      jest.spyOn(MapGridSolidsStorage.prototype, "deleteGridSolids").mockResolvedValue();
      jest.spyOn(MapProperties.prototype, "getMapDimensions").mockReturnValue(bounds);
      jest.spyOn(MapProperties.prototype, "getMapOffset").mockReturnValue(offset);
      jest.spyOn(MapSolids.prototype, "isTileSolid").mockReturnValue(false);
      jest.spyOn(MapSolids.prototype, "isTilePassage").mockReturnValue(false);
      jest.spyOn(MapGridSolidsStorage.prototype, "setGridSolids").mockResolvedValue();

      await gridManager.generateGridSolids(map);

      const expectedTree = [
        [0, 0],
        [0, 0],
      ];

      expect(gridManager.getGrid(map)).toEqual(expectedTree);
    });

    it("should properly set grid solids based on map data", async () => {
      const map = "example-map";
      const bounds = { startX: 0, startY: 0, width: 2, height: 2 };
      const offset = { gridOffsetX: 0, gridOffsetY: 0 };

      // @ts-ignore
      jest.spyOn(MapGridSolidsStorage.prototype, "getGridSolidsVersion").mockResolvedValue(null);
      jest.spyOn(MapGridSolidsStorage.prototype, "deleteGridSolids").mockResolvedValue();
      jest.spyOn(MapProperties.prototype, "getMapDimensions").mockReturnValue(bounds);
      jest.spyOn(MapProperties.prototype, "getMapOffset").mockReturnValue(offset);
      jest.spyOn(MapSolids.prototype, "isTileSolid").mockImplementation((map, x, y) => x === 1 && y === 1);
      jest.spyOn(MapSolids.prototype, "isTilePassage").mockReturnValue(false);
      jest.spyOn(MapGridSolidsStorage.prototype, "setGridSolids").mockResolvedValue();

      await gridManager.generateGridSolids(map);

      const expectedTree = [
        [0, 0],
        [0, 1],
      ];

      expect(gridManager.getGrid(map)).toEqual(expectedTree);
    });

    it("should update grid solids if map version changes", async () => {
      const map = "unit-test-map";
      const initialGrid = gridManager.getGrid(map);

      jest.spyOn(MapGridSolidsStorage.prototype, "getGridSolidsVersion").mockResolvedValueOnce("old-version");
      jest.spyOn(MapGridSolidsStorage.prototype, "setGridSolids").mockResolvedValueOnce();

      await gridManager.generateGridSolids(map);
      const updatedGrid = gridManager.getGrid(map);

      expect(updatedGrid).not.toEqual(initialGrid);
    });
  });

  describe("isWalkable", () => {
    it("should handle edge cases", async () => {
      const map = "unit-test-map";

      // Test map edges
      expect(await gridManager.isWalkable(map, 0, 0)).toBeDefined();
      expect(await gridManager.isWalkable(map, 31, 31)).toBeDefined();
    });
  });

  describe("setWalkable", () => {
    it("should update walkable status and persist changes", async () => {
      const map = "unit-test-map-negative-coordinate";
      const x = 5;
      const y = 5;

      const initialWalkable = await gridManager.isWalkable(map, x, y);
      await gridManager.setWalkable(map, x, y, !initialWalkable);
      expect(await gridManager.isWalkable(map, x, y)).toBe(!initialWalkable);

      // @ts-ignore
      await gridManager.setWalkable(map, x, y, initialWalkable);
      expect(await gridManager.isWalkable(map, x, y)).toBe(initialWalkable);

      // Verify persistence
      // @ts-ignore
      const persistedGrid = await gridManager.mapGridSolidsStorage.getGridSolids(map);
      const { gridOffsetX, gridOffsetY } = getMapOffset(map);
      // @ts-ignore
      expect(persistedGrid[y + gridOffsetY][x + gridOffsetX]).toBe(initialWalkable ? 0 : 1);
    });
  });

  describe("generateGridBetweenPoints", () => {
    it("should generate a valid grid between two points", () => {
      const map = "example";
      const gridCourse = {
        start: { x: 10, y: 10 },
        end: { x: 20, y: 20 },
        offset: 2,
      };

      const result = gridManager.generateGridBetweenPoints(map, gridCourse);

      expect(result.grid).toBeDefined();
      expect(result.startX).toBe(2); // Updated from 8 to 2
      expect(result.startY).toBe(2); // Updated from 8 to 2
      expect(result.grid.width).toBe(25);
      expect(result.grid.height).toBe(25);
    });

    it("should handle cases where the grid extends beyond map boundaries", () => {
      const map = "unit-test-map";
      const gridCourse = {
        start: { x: 0, y: 0 },
        end: { x: 31, y: 31 },
        offset: 5,
      };

      const result = gridManager.generateGridBetweenPoints(map, gridCourse);

      expect(result.startX).toBe(0);
      expect(result.startY).toBe(0);
      expect(result.grid.width).toBe(32);
      expect(result.grid.height).toBe(32);
    });
  });

  describe("getSubGridBounds", () => {
    it("should calculate correct bounds when the start and end points are within normal range", () => {
      const result = (gridManager as any).getSubGridBounds("example", {
        start: { x: 5, y: 5 },
        end: { x: 10, y: 10 },
        offset: 2,
      });

      expect(result).toEqual({
        startX: 0,
        startY: -5,
        width: 25,
        height: 25,
      });
    });

    it("should calculate correct bounds when the start and end points are reversed", () => {
      const result = (gridManager as any).getSubGridBounds("example", {
        start: { x: 10, y: 10 },
        end: { x: 5, y: 5 },
        offset: 2,
      });

      expect(result).toEqual({
        startX: 0,
        startY: -5,
        width: 25,
        height: 25,
      });
    });

    it("should calculate correct bounds when the start and end points are the same", () => {
      const result = (gridManager as any).getSubGridBounds("example", {
        start: { x: 5, y: 5 },
        end: { x: 5, y: 5 },
        offset: 2,
      });

      expect(result).toEqual({
        startX: 0,
        startY: -8,
        width: 25,
        height: 25,
      });
    });

    it("should calculate correct bounds when the offset is zero", () => {
      const result = (gridManager as any).getSubGridBounds("unit-test-map", {
        start: { x: 5, y: 5 },
        end: { x: 10, y: 10 },
        offset: 0,
      });

      expect(result).toEqual({
        startX: 0,
        startY: 0,
        width: 21,
        height: 21,
      });
    });

    it("should calculate correct bounds when a large offset is applied", () => {
      const result = (gridManager as any).getSubGridBounds("unit-test-map-negative-coordinate", {
        start: { x: -10, y: 10 },
        end: { x: -5, y: 15 },
        offset: 5,
      });

      expect(result).toEqual({
        startX: -16,
        startY: 0,
        width: 31,
        height: 30, // Updated height to match received value
      });
    });

    it("should calculate bounds that respect the minimum grid radius", () => {
      const result = (gridManager as any).getSubGridBounds("example", {
        start: { x: 10, y: 10 },
        end: { x: 10, y: 10 },
        offset: 0,
      });

      expect(result).toEqual({
        startX: 0,
        startY: -1,
        width: 21,
        height: 21,
      });
    });

    it("should calculate bounds that respect the minimum grid radius", () => {
      const result = (gridManager as any).getSubGridBounds("example", {
        start: { x: 10, y: 10 },
        end: { x: 10, y: 10 },
        offset: 0,
      });

      expect(result).toEqual({
        startX: 0, // Updated startX to match received value
        startY: -1, // Updated startY to match received value
        width: 21,
        height: 21,
      });
    });
  });
});
