import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { CharacterSocketEvents, NPCSocketEvents } from "@rpg-engine/shared";
import { NPCSpellLifeSteal } from "../NPCSpellLifeSteal";

describe("NPCSpellLifeSteal", () => {
  let npcSpellLifeSteal: NPCSpellLifeSteal;
  let testNPC: INPC;
  let testCharacter: ICharacter;
  let mockSocketMessaging: jest.Mocked<SocketMessaging>;

  beforeAll(() => {
    npcSpellLifeSteal = container.get(NPCSpellLifeSteal);
  });

  beforeEach(async () => {
    testNPC = await unitTestHelper.createMockNPC();
    testCharacter = await unitTestHelper.createMockCharacter();
    mockSocketMessaging = {
      sendEventToCharactersAroundCharacter: jest.fn(),
    } as any;
    (npcSpellLifeSteal as any).socketMessaging = mockSocketMessaging;
  });

  it("properly casts life steal from a NPC to a character", async () => {
    testNPC.health = 50;
    testNPC.maxHealth = 100;
    testCharacter.health = 100;
    testCharacter.maxHealth = 100;
    await testNPC.save();
    await testCharacter.save();

    jest.spyOn(npcSpellLifeSteal as any, "calculatePotentialLifeSteal").mockReturnValue(10);

    await npcSpellLifeSteal.performLifeSteal(testNPC, testCharacter);

    const updatedTestNPC = await NPC.findById(testNPC._id).lean();
    const updatedTestCharacter = await Character.findById(testCharacter._id).lean();

    expect(updatedTestNPC?.health).toBe(60);
    expect(updatedTestCharacter?.health).toBe(90);
  });

  it("avoids maxHealth overflow for NPC", async () => {
    testNPC.health = 95;
    testNPC.maxHealth = 100;
    testCharacter.health = 100;
    testCharacter.maxHealth = 100;
    await testNPC.save();
    await testCharacter.save();

    jest.spyOn(npcSpellLifeSteal as any, "calculatePotentialLifeSteal").mockReturnValue(10);

    await npcSpellLifeSteal.performLifeSteal(testNPC, testCharacter);

    const updatedTestNPC = await NPC.findById(testNPC._id).lean();
    const updatedTestCharacter = await Character.findById(testCharacter._id).lean();

    expect(updatedTestNPC?.health).toBe(100);
    expect(updatedTestCharacter?.health).toBe(90);
  });

  it("prevents character health from going below 1", async () => {
    testNPC.health = 50;
    testNPC.maxHealth = 100;
    testCharacter.health = 5;
    testCharacter.maxHealth = 100;
    await testNPC.save();
    await testCharacter.save();

    jest.spyOn(npcSpellLifeSteal as any, "calculatePotentialLifeSteal").mockReturnValue(10);

    await npcSpellLifeSteal.performLifeSteal(testNPC, testCharacter);

    const updatedTestNPC = await NPC.findById(testNPC._id).lean();
    const updatedTestCharacter = await Character.findById(testCharacter._id).lean();

    expect(updatedTestNPC?.health).toBe(60);
    expect(updatedTestCharacter?.health).toBe(1);
  });

  it("calculates potential life steal correctly", async () => {
    testCharacter.maxHealth = 100;
    await testCharacter.save();

    const calculatePotentialLifeSteal = (npcSpellLifeSteal as any).calculatePotentialLifeSteal;
    const result = calculatePotentialLifeSteal(testCharacter);

    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(10);
  });

  it("sends correct socket events", async () => {
    testNPC.health = 50;
    testNPC.maxHealth = 100;
    testCharacter.health = 100;
    testCharacter.maxHealth = 100;
    await testNPC.save();
    await testCharacter.save();

    jest.spyOn(npcSpellLifeSteal as any, "calculatePotentialLifeSteal").mockReturnValue(10);

    await npcSpellLifeSteal.performLifeSteal(testNPC, testCharacter);

    expect(mockSocketMessaging.sendEventToCharactersAroundCharacter).toHaveBeenCalledTimes(2);
    expect(mockSocketMessaging.sendEventToCharactersAroundCharacter).toHaveBeenCalledWith(
      testCharacter,
      NPCSocketEvents.NPCAttributeChanged,
      expect.objectContaining({ targetId: testNPC._id, health: 60 }),
      true
    );
    expect(mockSocketMessaging.sendEventToCharactersAroundCharacter).toHaveBeenCalledWith(
      testCharacter,
      CharacterSocketEvents.AttributeChanged,
      expect.objectContaining({ targetId: testCharacter._id, health: 90 }),
      true
    );
  });
});
