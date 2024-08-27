import { container } from "@providers/inversify/container";
import { IRaid, RaidManager } from "@providers/raid/RaidManager";

describe("RaidManager", () => {
  let raidManager: RaidManager;

  beforeAll(() => {
    raidManager = container.get(RaidManager);
  });

  it("should add a new raid and retrieve it", async () => {
    const raid: IRaid = {
      name: "test raid",
      key: "raid1",
      startingMessage: "warning",
      status: true,
      triggeringChance: 10,
      minDuration: 10,
    };

    await raidManager.addRaid(raid);
    const raidQuery = await raidManager.getRaid("raid1");
    expect(raidQuery).toEqual(raid);
  });

  it("should update a raid and retrieve the updated version", async () => {
    const raidUpdated: IRaid = {
      name: "test raid",
      key: "raid1",
      startingMessage: "warning updated",
      status: false,
      triggeringChance: 15,
      minDuration: 10,
    };

    await raidManager.updateRaid("raid1", raidUpdated);
    const raidQuery = await raidManager.getRaid("raid1");
    expect(raidQuery).toEqual(raidUpdated);
  });

  it("should delete a raid and confirm its absence", async () => {
    await raidManager.deleteRaid("raid1");
    const raidQuery = await raidManager.getRaid("raid1");
    expect(raidQuery).toBeUndefined();
  });

  it("should retrieve all raids", async () => {
    const raid1: IRaid = {
      name: "test raid",
      key: "raid1",
      startingMessage: "warning1",
      status: true,
      triggeringChance: 10,
      minDuration: 10,
    };

    const raid2: IRaid = {
      name: "test raid",
      key: "raid2",
      startingMessage: "warning2",
      status: false,
      triggeringChance: 20,
      minDuration: 10,
    };

    await raidManager.addRaid(raid1);
    await raidManager.addRaid(raid2);

    const allRaids = await raidManager.getAllRaids();
    expect(allRaids).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: raid1.key,
        }),
        expect.objectContaining({
          key: raid2.key,
        }),
      ])
    );
  });

  it("should retrieve all raid keys", async () => {
    const raid1: IRaid = {
      name: "test raid",
      key: "raid1",
      startingMessage: "warning1",
      status: true,
      triggeringChance: 10,
      minDuration: 10,
    };

    const raid2: IRaid = {
      name: "test raid",
      key: "raid2",
      startingMessage: "warning2",
      status: false,
      triggeringChance: 20,
      minDuration: 10,
    };

    await raidManager.addRaid(raid1);
    await raidManager.addRaid(raid2);

    const allKeys = await raidManager.getAllRaidKeys();
    expect(allKeys).toEqual(expect.arrayContaining([raid1.key, raid2.key]));
  });

  it("should query raids based on the provided criteria", async () => {
    const raid1: IRaid = {
      name: "test raid",
      key: "raid1",
      startingMessage: "warning1",
      status: true,
      triggeringChance: 10,
      minDuration: 10,
    };

    const raid2: IRaid = {
      name: "test raid",
      key: "raid2",
      startingMessage: "warning2",
      status: false,
      triggeringChance: 20,
      minDuration: 10,
    };

    const raid3: IRaid = {
      name: "test raid",
      key: "raid3",
      startingMessage: "warning3",
      status: true,
      triggeringChance: 30,
      minDuration: 10,
    };

    // Add raids
    await raidManager.addRaid(raid1);
    await raidManager.addRaid(raid2);
    await raidManager.addRaid(raid3);

    // Query raids where status is true
    const queriedRaids = await raidManager.queryRaids({ status: true });

    expect(queriedRaids).toEqual(expect.arrayContaining([raid1, raid3]));
    expect(queriedRaids).not.toEqual(expect.arrayContaining([raid2]));

    // Query raids where triggeringChance is 30
    const queriedRaidsTriggerChance = await raidManager.queryRaids({ triggeringChance: 30 });

    expect(queriedRaidsTriggerChance).toEqual([raid3]);
  });

  // New tests

  it("should throw an error when trying to update a non-existent raid", async () => {
    await expect(raidManager.updateRaid("nonExistentKey", { status: true })).rejects.toThrow(
      "Raid with key nonExistentKey not found"
    );
  });

  it("should delete all raids and confirm their absence", async () => {
    const raid1: IRaid = {
      name: "test raid",
      key: "raid1",
      startingMessage: "warning1",
      status: true,
      triggeringChance: 10,
      minDuration: 10,
    };

    const raid2: IRaid = {
      name: "test raid",
      key: "raid2",
      startingMessage: "warning2",
      status: false,
      triggeringChance: 20,
      minDuration: 10,
    };

    await raidManager.addRaid(raid1);
    await raidManager.addRaid(raid2);

    await raidManager.deleteAllRaids();
    const allRaids = await raidManager.getAllRaids();
    expect(allRaids).toEqual([]);
  });

  it("should return true if the raid is active and false otherwise", async () => {
    const raid: IRaid = {
      name: "test raid",
      key: "raid1",
      startingMessage: "warning1",
      status: true,
      triggeringChance: 10,
      minDuration: 10,
    };

    await raidManager.addRaid(raid);

    const isActive = await raidManager.isRaidActive("raid1");
    expect(isActive).toBe(true);

    await raidManager.updateRaid("raid1", { status: false });
    const isInactive = await raidManager.isRaidActive("raid1");
    expect(isInactive).toBe(false);
  });

  it("should return an empty array when no raids match the query criteria", async () => {
    const raids = await raidManager.queryRaids({ status: true, triggeringChance: 100 });
    expect(raids).toEqual([]);
  });

  it("should handle querying with multiple criteria", async () => {
    const raid1: IRaid = {
      name: "test raid",
      key: "raid1",
      startingMessage: "warning1",
      status: true,
      triggeringChance: 10,
      minDuration: 10,
    };

    const raid2: IRaid = {
      name: "test raid",
      key: "raid2",
      startingMessage: "warning2",
      status: true,
      triggeringChance: 20,
      minDuration: 10,
    };

    await raidManager.addRaid(raid1);
    await raidManager.addRaid(raid2);

    const queriedRaids = await raidManager.queryRaids({ status: true, triggeringChance: 20 });
    expect(queriedRaids).toEqual([raid2]);
  });

  it("should handle a large number of raids efficiently", async () => {
    const raids: IRaid[] = [];

    for (let i = 0; i < 1000; i++) {
      raids.push({
        name: `raid ${i}`,
        key: `raid${i}`,
        startingMessage: `message ${i}`,
        status: i % 2 === 0,
        triggeringChance: i,
        minDuration: 10,
      });
    }

    for (const raid of raids) {
      await raidManager.addRaid(raid);
    }

    const allRaids = await raidManager.getAllRaids();
    expect(allRaids.length).toBe(1000);
  });

  it("should throw an error when trying to update a non-existent raid", async () => {
    await expect(raidManager.updateRaid("nonExistentKey", { status: true })).rejects.toThrow(
      "Raid with key nonExistentKey not found"
    );
  });

  it("should delete all raids and confirm their absence", async () => {
    const raid1: IRaid = {
      name: "test raid",
      key: "raid1",
      startingMessage: "warning1",
      status: true,
      triggeringChance: 10,
      minDuration: 10,
    };

    const raid2: IRaid = {
      name: "test raid",
      key: "raid2",
      startingMessage: "warning2",
      status: false,
      triggeringChance: 20,
      minDuration: 10,
    };

    await raidManager.addRaid(raid1);
    await raidManager.addRaid(raid2);

    await raidManager.deleteAllRaids();
    const allRaids = await raidManager.getAllRaids();
    expect(allRaids).toEqual([]);

    // Additional check to ensure that no raids exist after deletion
    const allKeys = await raidManager.getAllRaidKeys();
    expect(allKeys).toEqual([]);
  });

  it("should update a raid and merge fields correctly", async () => {
    const raid: IRaid = {
      name: "test raid",
      key: "raid1",
      startingMessage: "warning",
      status: true,
      triggeringChance: 10,
      minDuration: 10,
    };

    await raidManager.addRaid(raid);

    const raidUpdated: Partial<IRaid> = {
      startingMessage: "updated warning",
      status: false,
    };

    await raidManager.updateRaid("raid1", raidUpdated);
    const raidQuery = await raidManager.getRaid("raid1");

    expect(raidQuery).toEqual({
      name: "test raid",
      key: "raid1",
      startingMessage: "updated warning",
      status: false,
      triggeringChance: 10, // This field should remain unchanged
      minDuration: 10, // This field should remain unchanged
    });
  });

  it("should return an empty array when no raids match the query criteria", async () => {
    const raids = await raidManager.queryRaids({ status: true, triggeringChance: 100 });
    expect(raids).toEqual([]);
  });

  it("should handle a large number of raids efficiently", async () => {
    const raids: IRaid[] = [];

    for (let i = 0; i < 1000; i++) {
      raids.push({
        name: `raid ${i}`,
        key: `raid${i}`,
        startingMessage: `message ${i}`,
        status: i % 2 === 0,
        triggeringChance: i,
        minDuration: 10,
      });
    }

    for (const raid of raids) {
      await raidManager.addRaid(raid);
    }

    const allRaids = await raidManager.getAllRaids();
    expect(allRaids.length).toBe(1000);
  });

  afterAll(async () => {
    await raidManager.deleteAllRaids();
  });
});
