/* eslint-disable no-unused-vars */
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { container, unitTestHelper } from "@providers/inversify/container";
import { FromGridX, FromGridY, NPCAlignment } from "@rpg-engine/shared";
import { NPCTarget } from "../movement/NPCTarget";

describe("NPCTarget", () => {
  let npcTarget: NPCTarget;
  let testNPC: INPC;
  let testCharacter: ICharacter;
  let inMemoryHashTable: InMemoryHashTable;
  let hasPathToTargetSpy: jest.SpyInstance;

  beforeAll(async () => {
    await unitTestHelper.initializeMapLoader();
    npcTarget = container.get<NPCTarget>(NPCTarget);
    inMemoryHashTable = container.get<InMemoryHashTable>(InMemoryHashTable);
  });

  beforeEach(async () => {
    testNPC = await unitTestHelper.createMockNPC(
      {
        x: FromGridX(0),
        y: FromGridY(0),
        maxAntiLuringRangeInGridCells: 150,
        maxRangeInGridCells: 10,
      },
      {
        hasSkills: true,
      }
    );

    // @ts-ignore
    hasPathToTargetSpy = jest.spyOn(NPCTarget.prototype, "hasPathToTarget").mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getTargetDirection", () => {
    it("should return correct direction for all cases", () => {
      expect(npcTarget.getTargetDirection(testNPC, FromGridX(5), FromGridY(0))).toBe("right");
      expect(npcTarget.getTargetDirection(testNPC, FromGridX(-5), FromGridY(0))).toBe("left");
      expect(npcTarget.getTargetDirection(testNPC, FromGridX(0), FromGridY(5))).toBe("down");
      expect(npcTarget.getTargetDirection(testNPC, FromGridX(0), FromGridY(-5))).toBe("up");
      expect(npcTarget.getTargetDirection(testNPC, FromGridX(0), FromGridY(0))).toBe("down");
    });
  });

  describe("tryToSetTarget", () => {
    it("should not set target if NPC already has a target", async () => {
      const testCharacter = await unitTestHelper.createMockCharacter({
        x: FromGridX(5),
        y: FromGridY(0),
      });

      testNPC.targetCharacter = testCharacter.id;
      await testNPC.save();
      await npcTarget.tryToSetTarget(testNPC);
      expect(String(testNPC.targetCharacter)).toStrictEqual(String(testCharacter.id));
    });

    it("should not set target if NPC is dead", async () => {
      testNPC.isAlive = false;
      await npcTarget.tryToSetTarget(testNPC);
      expect(testNPC.targetCharacter).toBeUndefined();
    });

    it("should not set target if NPC has 0 health", async () => {
      testNPC.health = 0;
      await npcTarget.tryToSetTarget(testNPC);
      expect(testNPC.targetCharacter).toBeUndefined();
    });

    it("should not set target if no maxRangeInGridCells is defined", async () => {
      testNPC.maxRangeInGridCells = undefined;
      await npcTarget.tryToSetTarget(testNPC);
      expect(testNPC.targetCharacter).toBeUndefined();
    });

    it("should set target to nearest character within range", async () => {
      const nearCharacter = await unitTestHelper.createMockCharacter({
        x: FromGridX(5),
        y: FromGridY(0),
      });
      const farCharacter = await unitTestHelper.createMockCharacter({
        x: FromGridX(20),
        y: FromGridY(0),
      });

      await npcTarget.tryToSetTarget(testNPC);

      testNPC = (await NPC.findById(testNPC.id)) as INPC;
      expect(testNPC.targetCharacter?.toString()).toBe(nearCharacter.id.toString());
    });
  });

  describe("tryToClearOutOfRangeTargets", () => {
    it("should do nothing if NPC has no target", async () => {
      await npcTarget.tryToClearOutOfRangeTargets(testNPC);
      expect(testNPC.targetCharacter).toBeUndefined();
    });

    it("should clear target if target character is not found", async () => {
      testNPC.targetCharacter = "nonexistentId";
      await npcTarget.tryToClearOutOfRangeTargets(testNPC);
      testNPC = (await NPC.findById(testNPC.id)) as INPC;
      expect(testNPC.targetCharacter).toBeUndefined();
    });

    it("should clear target if target is out of range", async () => {
      testCharacter = await unitTestHelper.createMockCharacter({
        x: FromGridX(5),
        y: FromGridY(0),
      });
      testNPC.targetCharacter = testCharacter.id;
      await testNPC.save();

      testCharacter.x = FromGridX(20);
      await testCharacter.save();

      await npcTarget.tryToClearOutOfRangeTargets(testNPC);
      testNPC = (await NPC.findById(testNPC.id)) as INPC;
      expect(testNPC.targetCharacter).toBeUndefined();
    });

    it("should clear target if target is offline", async () => {
      testCharacter = await unitTestHelper.createMockCharacter({
        x: FromGridX(5),
        y: FromGridY(0),
        isOnline: true,
      });
      testNPC.targetCharacter = testCharacter.id;
      await testNPC.save();

      testCharacter.isOnline = false;
      await testCharacter.save();

      await npcTarget.tryToClearOutOfRangeTargets(testNPC);
      testNPC = (await NPC.findById(testNPC.id)) as INPC;
      expect(testNPC.targetCharacter).toBeUndefined();
    });
  });

  describe("setTarget", () => {
    it("should not set target if NPC is dead", async () => {
      let deadNPC = await unitTestHelper.createMockNPC(
        {
          x: FromGridX(0),
          y: FromGridY(0),
          isAlive: false,
          health: 0,
        },
        {
          hasSkills: true,
        }
      );

      testCharacter = await unitTestHelper.createMockCharacter({
        x: FromGridX(5),
        y: FromGridY(0),
      });

      await npcTarget.setTarget(deadNPC, testCharacter);
      deadNPC = (await NPC.findById(deadNPC.id)) as INPC;
      expect(testNPC.targetCharacter).toBeUndefined();
    });

    it("should not set target if character has 0 health", async () => {
      testCharacter = await unitTestHelper.createMockCharacter({
        x: FromGridX(5),
        y: FromGridY(0),
        health: 0,
      });
      await npcTarget.setTarget(testNPC, testCharacter);
      testNPC = (await NPC.findById(testNPC.id)) as INPC;
      expect(testNPC.targetCharacter).toBeUndefined();
    });

    it("should set target if all conditions are met", async () => {
      testCharacter = await unitTestHelper.createMockCharacter({
        x: FromGridX(5),
        y: FromGridY(0),
      });
      await npcTarget.setTarget(testNPC, testCharacter);
      testNPC = (await NPC.findById(testNPC.id)) as INPC;
      expect(testNPC.targetCharacter?.toString()).toBe(testCharacter.id.toString());
    });
  });

  describe("Stealth and detection", () => {
    it("should not set target if character is in stealth and not detected", async () => {
      // @ts-ignore

      const stealthSpy = jest.spyOn(npcTarget.stealth, "isInvisible").mockResolvedValue(true);
      testCharacter = await unitTestHelper.createMockCharacter({
        x: FromGridX(5),
        y: FromGridY(0),
      });
      await npcTarget.tryToSetTarget(testNPC);
      testNPC = (await NPC.findById(testNPC.id)) as INPC;
      expect(testNPC.targetCharacter).toBeUndefined();
      stealthSpy.mockRestore();
    });

    it("should set target if character is detected despite being in stealth", async () => {
      const stealthSpy = jest
        // @ts-ignore
        .spyOn(npcTarget.stealth, "isInvisible")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const detectSpy = jest.spyOn(npcTarget as any, "checkInvisibilityDetected").mockReturnValue(true);
      testCharacter = await unitTestHelper.createMockCharacter({
        x: FromGridX(5),
        y: FromGridY(0),
      });
      await npcTarget.tryToSetTarget(testNPC);
      testNPC = (await NPC.findById(testNPC.id)) as INPC;
      expect(testNPC.targetCharacter?.toString()).toBe(testCharacter.id.toString());
      stealthSpy.mockRestore();
      detectSpy.mockRestore();
    });
  });

  describe("Non-PVP zone behavior", () => {
    it("should not set target if character is in non-PVP zone and NPC is hostile", async () => {
      testNPC.alignment = NPCAlignment.Hostile;
      await testNPC.save();

      // @ts-ignore
      const nonPvpZoneSpy = jest.spyOn(npcTarget.mapNonPVPZone, "isNonPVPZoneAtXY").mockReturnValue(true);
      testCharacter = await unitTestHelper.createMockCharacter({
        x: FromGridX(5),
        y: FromGridY(0),
      });

      await npcTarget.tryToSetTarget(testNPC);
      testNPC = (await NPC.findById(testNPC.id)) as INPC;
      expect(testNPC.targetCharacter).toBeUndefined();
      nonPvpZoneSpy.mockRestore();
    });

    it("should set target if character is in non-PVP zone but NPC is not hostile", async () => {
      testNPC.alignment = NPCAlignment.Friendly;
      await testNPC.save();

      // @ts-ignore
      const nonPvpZoneSpy = jest.spyOn(npcTarget.mapNonPVPZone, "isNonPVPZoneAtXY").mockReturnValue(true);
      testCharacter = await unitTestHelper.createMockCharacter({
        x: FromGridX(5),
        y: FromGridY(0),
      });

      await npcTarget.tryToSetTarget(testNPC);
      testNPC = (await NPC.findById(testNPC.id)) as INPC;
      expect(testNPC.targetCharacter?.toString()).toBe(testCharacter.id.toString());
      nonPvpZoneSpy.mockRestore();
    });
  });

  describe("Path finding", () => {
    it("should not set target if there's no path to the character", async () => {
      hasPathToTargetSpy.mockResolvedValue(false);

      testCharacter = await unitTestHelper.createMockCharacter({
        x: FromGridX(5),
        y: FromGridY(0),
      });

      await npcTarget.tryToSetTarget(testNPC);
      testNPC = (await NPC.findById(testNPC.id)) as INPC;
      expect(testNPC.targetCharacter).toBeUndefined();
    });

    it("should set target if there's a path to the character", async () => {
      hasPathToTargetSpy.mockResolvedValue(true);
      const pathfindingSpy = jest
        // @ts-ignore
        .spyOn(npcTarget.pathfindingQueue, "findPathForNPC")
        // @ts-ignore
        .mockResolvedValue([{ x: 1, y: 1 }]);

      testCharacter = await unitTestHelper.createMockCharacter({
        x: FromGridX(5),
        y: FromGridY(0),
      });

      await npcTarget.tryToSetTarget(testNPC);
      testNPC = (await NPC.findById(testNPC.id)) as INPC;
      expect(testNPC.targetCharacter?.toString()).toBe(testCharacter.id.toString());

      pathfindingSpy.mockRestore();
    });
  });
});
