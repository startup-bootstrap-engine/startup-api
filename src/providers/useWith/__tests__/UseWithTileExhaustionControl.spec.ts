/* eslint-disable no-unused-vars */
import { RESOURCE_MAX_GATHERING_PER_TILE_XY } from "@providers/constants/ResourceGatheringConstants";
import { container } from "@providers/inversify/container";
import { MapLayers } from "@rpg-engine/shared";
import { UseWithTileExhaustionControl } from "../abstractions/UseWithTileExhaustionControl";
import { IUseWithTargetTile } from "../useWithTypes";

describe("UseWithTileExhaustionControl.ts", () => {
  let useWithTileExhaustionControl: UseWithTileExhaustionControl;
  let inMemoryHashtableSetSpy: jest.SpyInstance;

  const mockTileData = { currentCount: 0, expirationTime: null } as any;
  const targetTile: IUseWithTargetTile = { x: 1, y: 1, map: "example", layer: MapLayers.Ground };

  beforeAll(() => {
    useWithTileExhaustionControl = container.get<UseWithTileExhaustionControl>(UseWithTileExhaustionControl);
  });

  beforeEach(() => {
    jest.resetAllMocks();

    // @ts-ignore
    jest.spyOn(useWithTileExhaustionControl.inMemoryHashTable, "get").mockResolvedValue(JSON.stringify(mockTileData));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("areResourcesDepleted should return false for a tile with resources", async () => {
    const result = await useWithTileExhaustionControl.areResourcesDepleted(targetTile);
    expect(result).toBe(false);
  });

  it("areResourcesDepleted should return true and update expiration when resources are depleted", async () => {
    // Setup for depletion
    mockTileData.currentCount = RESOURCE_MAX_GATHERING_PER_TILE_XY;

    // @ts-ignore
    jest.spyOn(useWithTileExhaustionControl.inMemoryHashTable, "get").mockResolvedValue(JSON.stringify(mockTileData));

    const result = await useWithTileExhaustionControl.areResourcesDepleted(targetTile);

    expect(result).toBe(true);
  });

  it("checkAndExpireTiles should expire tiles with past expiration time", async () => {
    // Mock current time
    const currentTime = new Date().getTime();
    jest.spyOn(Date, "now").mockImplementation(() => currentTime);

    // Mocking a tile with past expiration
    const expiredTileData = JSON.stringify({ currentCount: 999, expirationTime: currentTime - 1000 });
    const tiles = { "1-1": expiredTileData };

    // @ts-ignore
    jest.spyOn(useWithTileExhaustionControl.inMemoryHashTable, "getAll").mockResolvedValue(tiles);

    // @ts-ignore
    const deleteSpy = jest.spyOn(useWithTileExhaustionControl.inMemoryHashTable, "delete");

    await useWithTileExhaustionControl.checkAndExpireTiles();

    expect(deleteSpy).toHaveBeenCalledWith("use-item-to-tile", "1-1");
  });
});
