import { container, unitTestHelper } from "@providers/inversify/container";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { MathHelper } from "@providers/math/MathHelper";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { LightweightPathfinder } from "../LightweightPathfinder";
import { ToGridX, ToGridY } from "@rpg-engine/shared";

describe("LightweightPathfinder", () => {
  let lightweightPathfinder: LightweightPathfinder;
  let testNPC: INPC;

  beforeAll(async () => {
    lightweightPathfinder = container.get(LightweightPathfinder);
    await unitTestHelper.initializeMapLoader();
  });

  beforeEach(async () => {
    testNPC = await unitTestHelper.createMockNPC();
    jest.spyOn(InMemoryHashTable.prototype, "get").mockResolvedValue([]);
    jest.spyOn(InMemoryHashTable.prototype, "set").mockImplementation(async () => {});
    jest.spyOn(MovementHelper.prototype, "isSolid").mockResolvedValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should find the nearest grid to the target without getting stuck", async () => {
    const targetX = 10;
    const targetY = 10;

    const result = await lightweightPathfinder.getNearestGridToTarget(testNPC, targetX, targetY);

    console.log(result); // Debugging output

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("should update NPC previous positions correctly", async () => {
    const targetX = 10;
    const targetY = 10;

    const result = await lightweightPathfinder.getNearestGridToTarget(testNPC, targetX, targetY);

    console.log(result); // Debugging output

    expect(result).toBeDefined();
    expect(InMemoryHashTable.prototype.set).toHaveBeenCalledWith(
      "npc-positions",
      testNPC._id.toString(),
      expect.any(Array)
    );
  });

  it("should find the closest non-solid position to the target", async () => {
    const targetX = 10;
    const targetY = 10;

    const result = await lightweightPathfinder.getNearestGridToTarget(testNPC, targetX, targetY);

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("should return an empty array if all positions are solid", async () => {
    const targetX = 10;
    const targetY = 10;

    jest.spyOn(MovementHelper.prototype, "isSolid").mockResolvedValue(true);

    const result = await lightweightPathfinder.getNearestGridToTarget(testNPC, targetX, targetY);

    expect(result).toEqual([]);
  });
});
