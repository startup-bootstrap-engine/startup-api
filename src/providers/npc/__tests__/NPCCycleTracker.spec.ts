import { INPC } from "@entities/ModuleNPC/NPCModel";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { container, unitTestHelper } from "@providers/inversify/container";
import { NPCCycleTracker } from "../NPCCycleTracker";

describe("NPCCycleTracker.ts", () => {
  let npcCycleTracker: NPCCycleTracker;
  let inMemoryHashTable: InMemoryHashTable;
  let testNPC: INPC;

  beforeAll(() => {
    npcCycleTracker = container.get<NPCCycleTracker>(NPCCycleTracker);
    inMemoryHashTable = container.get<InMemoryHashTable>(InMemoryHashTable);

    jest.useFakeTimers({
      advanceTimers: true,
    });
  });

  beforeEach(async () => {
    testNPC = await unitTestHelper.createMockNPC();
  });

  afterEach(async () => {
    await npcCycleTracker.clearAllData();
    jest.clearAllMocks();
  });

  it("should track NPC cycle execution time", async () => {
    const spySet = jest.spyOn(inMemoryHashTable, "set");

    await npcCycleTracker.trackCycle(testNPC._id.toString());

    expect(spySet).toHaveBeenCalledTimes(1);
    expect(spySet).toHaveBeenCalledWith(
      "npc-cycle-tracker",
      `${testNPC._id}:lastExecution`,
      expect.objectContaining({ timestamp: expect.any(Number) })
    );
  });

  it("should update intervals when tracking multiple cycles", async () => {
    const npcId = testNPC._id.toString();

    await npcCycleTracker.trackCycle(npcId);

    // Simulate time passing
    jest.advanceTimersByTime(1000);

    await npcCycleTracker.trackCycle(npcId);

    const intervals = (await inMemoryHashTable.get("npc-cycle-tracker", `${npcId}:intervals`)) as { data: number[] };
    expect(intervals).toBeDefined();
    expect(intervals.data.length).toBe(1);
    expect(intervals.data[0]).toBeGreaterThan(1000);
  });

  it("should return null for getAverageInterval when no data is available", async () => {
    const average = await npcCycleTracker.getAverageInterval(testNPC._id.toString());
    expect(average).toBeNull();
  });

  it("should calculate correct average interval", async () => {
    const npcId = testNPC._id.toString();
    const intervals = [100, 200, 300];

    await inMemoryHashTable.set("npc-cycle-tracker", `${npcId}:intervals`, { data: intervals });

    const average = await npcCycleTracker.getAverageInterval(npcId);
    expect(average).toBe(200);
  });

  it("should clear all data", async () => {
    const npcId = testNPC._id.toString();

    await npcCycleTracker.trackCycle(npcId);
    await npcCycleTracker.clearAllData();

    const data = await inMemoryHashTable.getAll("npc-cycle-tracker");
    expect(data).toBeUndefined();
  });

  it("should calculate overall average cycle time", async () => {
    const npc1 = await unitTestHelper.createMockNPC();
    const npc2 = await unitTestHelper.createMockNPC();

    await inMemoryHashTable.set("npc-cycle-tracker", `${npc1._id}:intervals`, { data: [100, 200, 300] });
    await inMemoryHashTable.set("npc-cycle-tracker", `${npc2._id}:intervals`, { data: [150, 250, 350] });

    const overallAverage = await npcCycleTracker.getOverallAverageCycleTime();
    expect(overallAverage).toBe(225); // (100 + 200 + 300 + 150 + 250 + 350) / 6
  });

  it("should return 0 for overall average cycle time when no data is available", async () => {
    const overallAverage = await npcCycleTracker.getOverallAverageCycleTime();
    expect(overallAverage).toBe(0);
  });
});
