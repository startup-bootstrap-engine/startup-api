import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Item } from "@entities/ModuleInventory/ItemModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { CharacterDeath } from "@providers/character/CharacterDeath/CharacterDeath";
import { TimerWrapper } from "@providers/helpers/TimerWrapper";
import { container, unitTestHelper } from "@providers/inversify/container";
import { NPCDeathQueue } from "@providers/npc/NPCDeathQueue";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { spellGreaterHealing } from "@providers/spells/data/blueprints/all/SpellGreaterHealing";
import { spellSelfHealing } from "@providers/spells/data/blueprints/all/SpellSelfHealing";
import { berserkerSpellExecution } from "@providers/spells/data/blueprints/berserker/SpellExecution";
import { CharacterClass, EntityType } from "@rpg-engine/shared";
import { Execution } from "../Execution";

describe("Execution", () => {
  let testCharacter: ICharacter;
  let targetCharacter: ICharacter;
  let executionSpell: Execution;
  let sendEventToUser: jest.SpyInstance;
  let targetNPC: INPC;

  beforeAll(() => {
    executionSpell = container.get(Execution);

    jest.spyOn(TimerWrapper.prototype, "setTimeout").mockImplementation();

    jest.spyOn(SocketMessaging.prototype, "sendEventToUser").mockImplementation();
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(
      {
        health: 50,
        learnedSpells: [spellSelfHealing.key, spellGreaterHealing.key, berserkerSpellExecution.key] as any,
        class: CharacterClass.Berserker,
      },
      { hasSkills: true }
    );

    await Character.findByIdAndUpdate(testCharacter.id, { class: CharacterClass.Rogue });

    targetCharacter = await unitTestHelper.createMockCharacter(
      { health: 100 },
      { hasEquipment: false, hasInventory: false, hasSkills: true }
    );

    targetNPC = await unitTestHelper.createMockNPC({ health: 5 }, { hasSkills: true });

    sendEventToUser = jest.spyOn(SocketMessaging.prototype, "sendEventToUser");
  });

  it("should not execute spell if the health target > 30%", async () => {
    const timerMock = jest.spyOn(TimerWrapper.prototype, "setTimeout");
    timerMock.mockImplementation();

    targetNPC = await NPC.findByIdAndUpdate(targetNPC._id, { health: 40 }, { new: true }).lean();

    const result = await executionSpell.handleExecution(testCharacter, targetNPC);

    expect(result).toBe(false);

    const updatedTargetCharacter = await Character.findById(targetCharacter._id).lean();

    expect(updatedTargetCharacter?.health).toBe(100);

    const characterBody = await Item.findOne({
      name: `${targetCharacter.name}'s body`,
      scene: targetCharacter.scene,
    }).lean();

    expect(characterBody).toBeNull();

    expect(sendEventToUser).toHaveBeenCalledWith(testCharacter.channelId!, "ShowMessage", {
      message: "The target's health is above 30%, you can't execute it.",
      type: "error",
    });
  });

  it("should execute spell successfully for an NPC target", async () => {
    const timerMock = jest.spyOn(TimerWrapper.prototype, "setTimeout");
    timerMock.mockImplementation();

    expect(targetNPC.health).toBe(5);
    expect(targetNPC.isAlive).toBe(true);

    await executionSpell.handleExecution(testCharacter, targetNPC);

    const updateNPC = (await NPC.findById(targetNPC._id).lean()) as INPC;

    const npcBody = await Item.findOne({
      name: `${targetNPC.name}'s body`,
      scene: targetNPC.scene,
    })
      .populate("itemContainer")
      .exec();

    expect(npcBody).not.toBeNull();

    expect(updateNPC.health).toBe(0);
  });

  it("should not execute spell if attacker or target is missing", async () => {
    const result = await executionSpell.handleExecution(null as any, null as any);
    expect(result).toBe(false);
  });

  it("should not execute spell if attacker targets themselves", async () => {
    const result = await executionSpell.handleExecution(testCharacter, testCharacter);
    expect(result).toBe(false);
  });

  it("should execute spell successfully for a Character target", async () => {
    targetCharacter = (await Character.findByIdAndUpdate(
      targetCharacter._id,
      { health: 5, maxHealth: 100 },

      { new: true }
    ).lean()) as ICharacter;

    const characterDeathSpy = jest.spyOn(CharacterDeath.prototype, "handleCharacterDeath").mockResolvedValue();

    await executionSpell.handleExecution(testCharacter, targetCharacter);

    expect(characterDeathSpy).toHaveBeenCalledWith(testCharacter, targetCharacter);
  });

  it("should use custom health threshold if provided", async () => {
    targetNPC = (await NPC.findByIdAndUpdate(
      targetNPC._id,
      { health: 45, maxHealth: 100 },
      { new: true }
    ).lean()) as INPC;

    const result = await executionSpell.handleExecution(testCharacter, targetNPC, 50);

    expect(result).toBe(true);
  });

  it("should handle missing type and set it for NPC", async () => {
    // @ts-ignore
    delete targetNPC.type;

    const npcDeathSpy = jest.spyOn(NPCDeathQueue.prototype, "handleNPCDeath").mockResolvedValue();

    await executionSpell.handleExecution(testCharacter, targetNPC as any);

    expect(npcDeathSpy).toHaveBeenCalled();
  });

  it("should handle missing type and set it for Character", async () => {
    const targetWithoutType = { ...targetCharacter };
    // @ts-ignore
    delete targetWithoutType.type;

    const result = await executionSpell.handleExecution(testCharacter, targetWithoutType as any);

    expect(result).toBe(false); // Assuming the execution should fail for health > 30%
    expect(targetWithoutType.type).toBe(EntityType.Character);
  });
});
