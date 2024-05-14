import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { MODE_EXP_MULTIPLIER } from "@providers/constants/SkillConstants";
import { container, unitTestHelper } from "@providers/inversify/container";
import { PartyCRUD } from "@providers/party/PartyCRUD";
import PartyInvitation from "@providers/party/PartyInvitation";
import { ICharacterParty } from "@providers/party/PartyTypes";
import { Modes, calculateXPToNextLevel } from "@rpg-engine/shared";
import { v4 as uuidv4 } from "uuid";
import { NPCExperience } from "../NPCExperience";

describe("NPCExperience.spec.ts | releaseXP test cases", () => {
  let npcExperience: NPCExperience;
  let testCharacter: ICharacter;
  let testNPC: INPC;
  let xpToLvl3: number;
  let xpToLvl4: number;
  let expToRelease: number;

  beforeAll(() => {
    npcExperience = container.get<NPCExperience>(NPCExperience);
    xpToLvl3 = calculateXPToNextLevel(0, 3);
    xpToLvl4 = calculateXPToNextLevel(0, 4);
    expToRelease = xpToLvl3 - 1;
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter({}, { hasSkills: true });

    testNPC = await unitTestHelper.createMockNPC(
      {
        xpToRelease: [
          {
            xpId: uuidv4(),
            charId: testCharacter.id,
            xp: expToRelease,
          },
        ],
      },
      { hasSkills: true }
    );

    testNPC.health = 0;
    await testNPC.save();

    await testCharacter.populate("skills").execPopulate();
    await testNPC.populate("skills").execPopulate();

    jest.useFakeTimers({
      advanceTimers: true,
    });

    jest.spyOn(NPC, "updateOne");
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllTimers();
  });

  describe("Character modes", () => {
    it("should receive the regular experience when no mode is set (soft mode)", async () => {
      await npcExperience.releaseXP(testNPC);

      const updatedSkills = (await Skill.findById(testCharacter.skills).lean()) as ISkill;

      expect(updatedSkills.level).toBe(2);
      expect(updatedSkills.experience).toBe(expToRelease);
      expect(updatedSkills.xpToNextLevel).toBe(1);
      expect(testNPC.xpToRelease?.length).toBe(0);
    });

    it("should receive a experience bonus when the character is Hardcore Mode", async () => {
      testCharacter.mode = Modes.HardcoreMode;
      await testCharacter.save();

      await npcExperience.releaseXP(testNPC);

      const updatedSkills = (await Skill.findById(testCharacter.skills).lean()) as ISkill;

      const expectedExperience = expToRelease * MODE_EXP_MULTIPLIER[Modes.HardcoreMode];
      expect(updatedSkills.level).toBe(3);
      expect(updatedSkills.experience).toBe(expectedExperience);
      expect(updatedSkills.xpToNextLevel).toBe(xpToLvl4 - expectedExperience);
      expect(testNPC.xpToRelease?.length).toBe(0);
    });
  });

  describe("Premium Account", () => {
    let premiumCharacter: ICharacter;
    let xpMultiplierSpy: jest.SpyInstance;

    beforeEach(async () => {
      premiumCharacter = await unitTestHelper.createMockCharacter(null, { isPremiumAccount: true, hasSkills: true });

      // mock private method npcExperience.getXPMultiplier
      xpMultiplierSpy = jest.spyOn(npcExperience as any, "getXPMultiplier");
    });

    it("should receive a XP buff when the character has a Golden premium account", async () => {
      testNPC.xpToRelease = [
        {
          xpId: uuidv4(),
          charId: premiumCharacter.id,
          xp: expToRelease,
        } as any,
      ];
      await testNPC.save();

      await npcExperience.releaseXP(testNPC);

      //! That's why I fucking hate Jest. Look at this freak show
      // check if xpMultiplierSpy async promise returns 1.5
      expect(await xpMultiplierSpy.mock.results[0].value).toBe(1.5);
    });
  });

  it("should update NPC when xp is in range", async () => {
    // @ts-ignore
    jest.spyOn(npcExperience.experienceLimiter, "isXpInRange").mockReturnValue(true);

    await npcExperience.recordXPinBattle(testCharacter, testNPC, 50);

    expect(NPC.updateOne).toHaveBeenCalledWith({ _id: testNPC._id }, { xpToRelease: testNPC.xpToRelease });
  });

  it("should return a base exp when xp in range is great than max base xp", async () => {
    // @ts-ignore
    jest.spyOn(npcExperience.experienceLimiter, "isXpInRange").mockReturnValue(false);

    expect(testNPC.experience).toBe(100);

    await npcExperience.recordXPinBattle(testCharacter, testNPC, 50);

    expect(testNPC.xpToRelease?.length).toBe(1);

    if (testNPC.xpToRelease) {
      for (const released of testNPC.xpToRelease) {
        expect(released.xp).toBe(100);
      }
    }

    expect(NPC.updateOne).toHaveBeenCalled();
  });

  describe("XP Distribution in Party", () => {
    let partyLeader: ICharacter;
    let partyMembers: ICharacter[];
    let partyCRUD: PartyCRUD;
    let partyInvitation: PartyInvitation;

    beforeAll(() => {
      partyCRUD = container.get<PartyCRUD>(PartyCRUD);
      partyInvitation = container.get<PartyInvitation>(PartyInvitation);
    });

    beforeEach(async () => {
      partyLeader = await unitTestHelper.createMockCharacter({}, { hasSkills: true });
      partyMembers = await Promise.all(
        Array.from({ length: 2 }).map(() => unitTestHelper.createMockCharacter({}, { hasSkills: true }))
      );

      await partyCRUD.createParty(partyLeader, partyMembers[0]);
      await partyInvitation.acceptInvite(partyLeader, partyMembers[1]);

      const party = (await partyCRUD.findPartyByCharacterId(partyLeader._id)) as ICharacterParty;

      testNPC.xpToRelease = [
        {
          xpId: uuidv4(),
          charId: partyLeader.id,
          xp: expToRelease,
          partyId: party._id as any,
        },
        {
          xpId: uuidv4(),
          charId: partyMembers[0].id,
          xp: expToRelease,
          partyId: party._id as any,
        },
        {
          xpId: uuidv4(),
          charId: partyMembers[1].id,
          xp: expToRelease,
          partyId: party._id as any,
        },
      ];

      await testNPC.save();
    });

    it("should distribute XP among party members within range", async () => {
      jest
        // @ts-ignore
        .spyOn(npcExperience.partyValidator, "isWithinRange")
        .mockResolvedValue(new Set(partyMembers.map((member) => member._id)));

      // @ts-ignore
      const updateSkillsSpy = jest.spyOn(npcExperience, "updateSkillsAndSendEvents");

      await npcExperience.releaseXP(testNPC);

      expect(updateSkillsSpy).toHaveBeenCalledTimes(6);
    });
  });
});
