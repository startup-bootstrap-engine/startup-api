import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { BattleAttackRanged } from "@providers/battle/BattleAttackTarget/BattleAttackRanged";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { container, unitTestHelper } from "@providers/inversify/container";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { spellsBlueprints } from "@providers/spells/data/blueprints";
import { ISpell, MagicPower } from "@rpg-engine/shared";
import { NPCSpellArea } from "../area-spells/NPCSpellArea";

describe("NPCSpellArea", () => {
  let testCharacter: ICharacter;
  let testNPC: INPC;
  let npcSpellArea: NPCSpellArea;
  let blueprintManagerSpy: jest.SpyInstance;
  let movementHelperSpy: jest.SpyInstance;
  let battleAttackRangedSpy: jest.SpyInstance;

  beforeAll(() => {
    npcSpellArea = container.get(NPCSpellArea);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasSkills: true });
    testNPC = await unitTestHelper.createMockNPC();

    blueprintManagerSpy = jest.spyOn(BlueprintManager.prototype, "getBlueprint");
    movementHelperSpy = jest.spyOn(MovementHelper.prototype, "isUnderRange");
    battleAttackRangedSpy = jest.spyOn(BattleAttackRanged.prototype, "isSolidInRangedTrajectory");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return false if there is a solid object in trajectory", async () => {
    battleAttackRangedSpy.mockResolvedValue(true);

    const result = await npcSpellArea.castNPCSpell(testNPC, testCharacter);

    expect(result).toBe(false);
  });

  it("should return false if NPC blueprint is not found", async () => {
    battleAttackRangedSpy.mockResolvedValue(false);
    blueprintManagerSpy.mockResolvedValue(null);

    const result = await npcSpellArea.castNPCSpell(testNPC, testCharacter);

    expect(result).toBe(false);
  });

  it("should return false if no area spells are available", async () => {
    battleAttackRangedSpy.mockResolvedValue(false);
    blueprintManagerSpy.mockResolvedValue({ areaSpells: [] });

    const result = await npcSpellArea.castNPCSpell(testNPC, testCharacter);

    expect(result).toBe(false);
  });

  it("should return false if target is out of range", async () => {
    battleAttackRangedSpy.mockResolvedValue(false);
    blueprintManagerSpy.mockResolvedValue({
      areaSpells: [{ spellKey: "testSpell", probability: 100, power: {} as MagicPower }],
    });
    // @ts-ignore
    spellsBlueprints.testSpell = { maxDistanceGrid: 10 } as ISpell;
    movementHelperSpy.mockReturnValue(false);

    const result = await npcSpellArea.castNPCSpell(testNPC, testCharacter);

    expect(result).toBe(false);
  });

  it("should call spell's usableEffect if all checks pass", async () => {
    const usableEffectMock = jest.fn();
    battleAttackRangedSpy.mockResolvedValue(false);
    blueprintManagerSpy.mockResolvedValue({
      areaSpells: [{ spellKey: "testSpell", probability: 100, power: {} as MagicPower }],
    });
    // @ts-ignore
    spellsBlueprints.testSpell = { maxDistanceGrid: 10, usableEffect: usableEffectMock } as ISpell;
    movementHelperSpy.mockReturnValue(true);

    const result = await npcSpellArea.castNPCSpell(testNPC, testCharacter);

    expect(usableEffectMock).toHaveBeenCalledWith(testNPC, testCharacter);
    expect(result).toBe(true);
  });

  it("should log an error if an exception occurs", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    battleAttackRangedSpy.mockRejectedValue(new Error("test error"));

    await npcSpellArea.castNPCSpell(testNPC, testCharacter);

    expect(consoleErrorSpy).toHaveBeenCalledWith(new Error("test error"));
    consoleErrorSpy.mockRestore();
  });
});