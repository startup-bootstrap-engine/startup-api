import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterClass, FromGridX, FromGridY } from "@rpg-engine/shared";
import { BattleAttackTarget } from "../BattleAttackTarget";
import { BattleAttackTargetDeath } from "../BattleAttackTargetDeath";

jest.mock("../../../entityEffects/EntityEffectCycle.ts", () => ({
  EntityEffectCycle: jest.fn(),
}));

describe("BattleAttackTarget.spec.ts", () => {
  let battleAttackTarget: BattleAttackTarget;
  let battleAttackTargetDeath: BattleAttackTargetDeath;

  let testNPC: INPC;
  let testCharacter: ICharacter;

  let hitTargetSpy: jest.SpyInstance;

  beforeAll(async () => {
    battleAttackTarget = container.get<BattleAttackTarget>(BattleAttackTarget);
    battleAttackTargetDeath = container.get<BattleAttackTargetDeath>(BattleAttackTargetDeath);

    await unitTestHelper.initializeMapLoader();
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    testNPC = await unitTestHelper.createMockNPC(null, { hasSkills: true });
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasSkills: true,
    });

    testCharacter.x = FromGridX(0);
    testCharacter.y = FromGridX(0);
    (await Character.findByIdAndUpdate(testCharacter._id, testCharacter).lean()) as ICharacter;

    testNPC.x = FromGridX(1);
    testNPC.y = FromGridX(1);
    (await NPC.findByIdAndUpdate(testNPC._id, testNPC).lean()) as INPC;

    // @ts-ignore
    hitTargetSpy = jest.spyOn(battleAttackTarget.hitTarget, "hit" as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should NOT hit a target if there is a solid object in the trajectory", async () => {
    // @ts-ignore
    jest.spyOn(battleAttackTarget.battleAttackRanged, "isSolidInRangedTrajectory").mockResolvedValue(true);

    const attacker = testCharacter;
    const defender = testNPC;

    await battleAttackTarget.checkRangeAndAttack(attacker, defender);

    expect(hitTargetSpy).not.toHaveBeenCalled();
  });

  it("should NOT hit a target if attacker has melee attack type and target is out of range", async () => {
    const attacker = testCharacter;
    attacker.x = FromGridX(0);
    attacker.y = FromGridY(0);
    (await Character.findByIdAndUpdate(attacker._id, attacker).lean()) as ICharacter;

    const defender = testNPC;
    defender.x = FromGridX(5);
    defender.y = FromGridY(5);
    (await Character.findByIdAndUpdate(defender._id, defender as any).lean()) as ICharacter;

    await battleAttackTarget.checkRangeAndAttack(attacker, defender);

    // expect battleAttackTarget to not have been called

    expect(hitTargetSpy).not.toHaveBeenCalled();
  });

  it("should hit a target if attacker has melee attack type and target is in range", async () => {
    await testNPC.populate("skills").execPopulate();
    await testCharacter.populate("skills").execPopulate();

    await battleAttackTarget.checkRangeAndAttack(testNPC, testCharacter);

    // expect battleAttackTarget to not have been called

    expect(hitTargetSpy).toHaveBeenCalled();
  });
});

describe("PVP battle", () => {
  let battleAttackTarget: BattleAttackTarget;

  let targetCharacter: ICharacter;
  let attackerCharacter: ICharacter;

  beforeAll(async () => {
    battleAttackTarget = container.get<BattleAttackTarget>(BattleAttackTarget);
    await unitTestHelper.initializeMapLoader();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    targetCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasSkills: true,
    });
    attackerCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasSkills: true,
    });

    attackerCharacter.x = FromGridX(0);
    attackerCharacter.y = FromGridX(0);
    attackerCharacter.class = CharacterClass.Hunter;

    (await Character.findByIdAndUpdate(attackerCharacter._id, attackerCharacter).lean()) as ICharacter;

    targetCharacter.x = FromGridX(1);
    targetCharacter.y = FromGridX(1);
    targetCharacter.class = CharacterClass.Warrior;

    (await Character.findByIdAndUpdate(targetCharacter._id, targetCharacter).lean()) as ICharacter;

    jest.clearAllMocks();
  });

  it("should NOT hit a target if attacker has melee attack type and target is out of range", async () => {
    // @ts-ignore
    const hitTarget = jest.spyOn(battleAttackTarget.hitTarget, "hit" as any);

    const attacker = attackerCharacter;
    attacker.x = FromGridX(0);
    attacker.y = FromGridY(0);

    (await Character.findByIdAndUpdate(attacker._id, attacker).lean()) as ICharacter;

    const defender = targetCharacter;
    defender.x = FromGridX(5);
    defender.y = FromGridY(5);

    (await Character.findByIdAndUpdate(defender._id, defender).lean()) as ICharacter;

    await battleAttackTarget.checkRangeAndAttack(attacker, defender);

    // expect battleAttackTarget to not have been called

    expect(hitTarget).not.toHaveBeenCalled();
  });

  it("should hit a target if attacker has melee attack type and target is in range", async () => {
    await targetCharacter.populate("skills").execPopulate();
    await attackerCharacter.populate("skills").execPopulate();

    // expect battleAttackTarget to have been called
    // @ts-ignore
    const hitTarget = jest.spyOn(battleAttackTarget.hitTarget, "hit" as any);

    await battleAttackTarget.checkRangeAndAttack(targetCharacter, attackerCharacter);

    expect(hitTarget).toHaveBeenCalled();
  });
});
