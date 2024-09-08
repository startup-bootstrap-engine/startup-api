import { container } from "@providers/inversify/container";
import { availableRaids } from "../NPCAvailableRaids";
import { NPCRaidSeeder } from "../NPCRaidSeeder";
import { RaidManager } from "../RaidManager";

describe("NPCRaidSeeder", () => {
  let npcRaidSeeder: NPCRaidSeeder;
  let raidManager: RaidManager;

  beforeAll(() => {
    npcRaidSeeder = container.get(NPCRaidSeeder);
    raidManager = container.get(RaidManager);
  });

  beforeEach(async () => {
    // Clean the environment before each test
    await raidManager.deleteAllRaids();
  });

  it("should seed all raids when none exist", async () => {
    await npcRaidSeeder.seed();

    const allRaids = await raidManager.getAllRaids();
    expect(allRaids.length).toBeGreaterThan(0);
    expect(allRaids.map((raid) => raid.key)).toEqual(expect.arrayContaining(availableRaids.map((raid) => raid.key)));
  });

  it("should not duplicate an existing raid", async () => {
    // Manually add a raid that is supposed to be seeded
    await raidManager.addRaid({
      name: "Ilya Orc's Invasion",
      key: "orc-raid-ilya",
      startingMessage: "Test message",
      status: false,
      triggeringChance: 20,
      minDuration: 10,
    });

    await npcRaidSeeder.seed();

    const allRaidKeys = await raidManager.getAllRaidKeys();
    const occurrences = allRaidKeys.filter((key) => key === "orc-raid-ilya").length;
    expect(occurrences).toEqual(1); // should not duplicate
  });

  it("should update an existing raid if its key already exists", async () => {
    const existingRaid = {
      name: "Ilya Orc's Invasion",
      key: "orc-raid-ilya",
      startingMessage: "Old message",
      status: false,
      triggeringChance: 20,
      minDuration: 10,
    };

    await raidManager.addRaid(existingRaid);

    await npcRaidSeeder.seed();

    const updatedRaid = await raidManager.getRaid("orc-raid-ilya");
    expect(updatedRaid).toMatchObject({
      startingMessage: "Orcs are invading Ilya! Defend the city!", // should be updated from availableRaids
      triggeringChance: 1, // should be updated from availableRaids
      minDuration: 15, // should be updated from availableRaids
    });
  });

  it("should log an error if seeding fails", async () => {
    const logSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Simulate an error by throwing inside addRaid
    jest.spyOn(RaidManager.prototype, "addRaid").mockImplementationOnce(() => {
      throw new Error("Simulated failure");
    });

    await npcRaidSeeder.seed();

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Error while seeding raids: Simulated failure"));
    logSpy.mockRestore();
  });

  it("should seed raids incrementally without removing existing raids", async () => {
    // Seed only a subset of available raids
    const partialRaids = availableRaids.slice(0, 3);
    for (const raid of partialRaids) {
      await raidManager.addRaid(raid);
    }

    // Now run the full seeding process
    await npcRaidSeeder.seed();

    const allRaids = await raidManager.getAllRaids();
    expect(allRaids.length).toBe(availableRaids.length);
    expect(allRaids.map((raid) => raid.key)).toEqual(expect.arrayContaining(availableRaids.map((raid) => raid.key)));
  });

  it("should confirm that all raids are seeded", async () => {
    await npcRaidSeeder.seed();

    const allRaids = await raidManager.getAllRaids();
    expect(allRaids.length).toBe(availableRaids.length);
    expect(allRaids.map((raid) => raid.key)).toEqual(expect.arrayContaining(availableRaids.map((raid) => raid.key)));
  });

  it("should throw an error if not all raids are seeded", async () => {
    // Mock the getAllRaids method to simulate a scenario where not all raids are seeded
    // eslint-disable-next-line require-await
    jest.spyOn(RaidManager.prototype, "getAllRaids").mockImplementationOnce(async () => {
      return availableRaids.slice(0, availableRaids.length - 1); // return one less than expected
    });

    const logSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await npcRaidSeeder.seed();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error while seeding raids: Failed to seed all raids. Expected 8 but got 7.")
    );

    logSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it("should not throw an error if all raids are seeded", async () => {
    // Mock the getAllRaids method to return the correct number of raids
    // eslint-disable-next-line require-await
    jest.spyOn(raidManager, "getAllRaids").mockImplementationOnce(async () => {
      return availableRaids; // return all expected raids
    });

    const logSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await npcRaidSeeder.seed();

    expect(logSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("Error while seeding raids: Not all raids were seeded")
    );

    logSpy.mockRestore();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await raidManager.deleteAllRaids();
  });
});
