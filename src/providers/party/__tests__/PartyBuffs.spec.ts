import { CharacterBuff } from "@entities/ModuleCharacter/CharacterBuffModel";
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterClass,
  CharacterPartyBenefits,
  CombatSkill,
} from "@rpg-engine/shared";
import { PartyBenefitsCalculator } from "../PartyBenefitsCalculator";
import { PartyBuff } from "../PartyBuff";
import { PartyClasses } from "../PartyClasses";
import { ICharacterParty } from "../PartyTypes";

describe("PartyBuff", () => {
  let partyBuff: PartyBuff;
  let characterLeader: ICharacter;
  let firstMember: ICharacter;
  let secondMember: ICharacter;
  let partyClasses: PartyClasses;
  let partyBenefitsCalculator: PartyBenefitsCalculator;
  let messageSpy: jest.SpyInstance;

  beforeAll(() => {
    partyBuff = container.get<PartyBuff>(PartyBuff);
    partyClasses = container.get<PartyClasses>(PartyClasses);
    partyBenefitsCalculator = container.get<PartyBenefitsCalculator>(PartyBenefitsCalculator);
    messageSpy = jest.spyOn(partyBuff, "handleAllBuffInParty");
  });

  beforeEach(async () => {
    characterLeader = await unitTestHelper.createMockCharacter(
      {
        class: CharacterClass.Rogue,
        name: "Character Leader",
      },
      {
        hasEquipment: true,
        hasSkills: true,
        hasInventory: true,
      }
    );

    firstMember = await unitTestHelper.createMockCharacter(
      {
        class: CharacterClass.Berserker,
        name: "First Member",
      },
      {
        hasEquipment: true,
        hasSkills: true,
        hasInventory: true,
      }
    );

    secondMember = await unitTestHelper.createMockCharacter(
      {
        class: CharacterClass.Hunter,
        name: "Second Member",
      },
      {
        hasEquipment: true,
        hasSkills: true,
        hasInventory: true,
      }
    );
  });

  afterEach(() => {
    messageSpy.mockClear();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("should add buffs to the party once only when call applyCharacterBuff", async () => {
    const trait = ["strength"];

    // @ts-ignore
    await partyBuff.applyCharacterBuff(characterLeader, trait, 2);
    // @ts-ignore
    await partyBuff.applyCharacterBuff(characterLeader, trait, 2);

    const partyBuffs = await CharacterBuff.find({
      owner: characterLeader._id,
      trait: trait[0],
      durationType: CharacterBuffDurationType.Permanent,
      originateFrom: "party",
    }).lean();

    expect(partyBuffs.length).toBe(1);
  });

  it("should delete all buffs from the party when call removeCharacterBuff", async () => {
    const trait = ["strength"];

    // @ts-ignore
    await partyBuff.applyCharacterBuff(characterLeader, trait, 2);

    // @ts-ignore
    await partyBuff.removeCharacterBuff(characterLeader, trait, 2);

    const partyBuffs = await CharacterBuff.find({
      owner: characterLeader._id,
      trait: trait[0],
      durationType: CharacterBuffDurationType.Permanent,
      originateFrom: "party",
    }).lean();

    expect(partyBuffs.length).toBe(0);
  });

  it("should handle all buffs in party correctly when adding buffs", async () => {
    const party: ICharacterParty = {
      leader: characterLeader,
      // @ts-ignore
      members: [firstMember, secondMember],
      size: 3,
    };

    // @ts-ignore
    jest.spyOn(partyClasses, "getDifferentClasses").mockReturnValue(["Rogue", "Berserker", "Hunter"]);
    jest.spyOn(partyBenefitsCalculator, "calculatePartyBenefits").mockReturnValue([
      {
        benefit: CharacterPartyBenefits.Skill,
        value: 10,
      },
    ]);

    await partyBuff.handleAllBuffInParty(party, true);

    const leaderBuffs = await CharacterBuff.find({
      owner: characterLeader._id,
      durationType: CharacterBuffDurationType.Permanent,
      originateFrom: "party",
    }).lean();

    const firstMemberBuffs = await CharacterBuff.find({
      owner: firstMember._id,
      durationType: CharacterBuffDurationType.Permanent,
      originateFrom: "party",
    }).lean();

    const secondMemberBuffs = await CharacterBuff.find({
      owner: secondMember._id,
      durationType: CharacterBuffDurationType.Permanent,
      originateFrom: "party",
    }).lean();

    expect(leaderBuffs.length).toBeGreaterThan(0);
    expect(firstMemberBuffs.length).toBeGreaterThan(0);
    expect(secondMemberBuffs.length).toBeGreaterThan(0);
  });

  it("should handle all buffs in party correctly when removing buffs", async () => {
    const party: ICharacterParty = {
      leader: characterLeader,
      // @ts-ignore
      members: [firstMember, secondMember],
      size: 3,
    };

    // @ts-ignore
    jest.spyOn(partyClasses, "getDifferentClasses").mockReturnValue(["Rogue", "Berserker", "Hunter"]);
    jest.spyOn(partyBenefitsCalculator, "calculatePartyBenefits").mockReturnValue([
      {
        benefit: CharacterPartyBenefits.Skill,
        value: 10,
      },
    ]);

    await partyBuff.handleAllBuffInParty(party, true);

    await partyBuff.handleAllBuffInParty(party, false);

    const leaderBuffs = await CharacterBuff.find({
      owner: characterLeader._id,
      durationType: CharacterBuffDurationType.Permanent,
      originateFrom: "party",
    }).lean();

    const firstMemberBuffs = await CharacterBuff.find({
      owner: firstMember._id,
      durationType: CharacterBuffDurationType.Permanent,
      originateFrom: "party",
    }).lean();

    const secondMemberBuffs = await CharacterBuff.find({
      owner: secondMember._id,
      durationType: CharacterBuffDurationType.Permanent,
      originateFrom: "party",
    }).lean();

    expect(leaderBuffs.length).toBe(0);
    expect(firstMemberBuffs.length).toBe(0);
    expect(secondMemberBuffs.length).toBe(0);
  });

  it("should get correct class traits for a character", () => {
    // @ts-ignore
    const traits = partyBuff.getClassTraits(CharacterClass.Rogue);
    expect(traits).toEqual([BasicAttribute.Dexterity, CombatSkill.Dagger]);
  });

  it("should return default traits if character class is not found", () => {
    // @ts-ignore
    const traits = partyBuff.getClassTraits("UnknownClass" as CharacterClass);
    expect(traits).toEqual([BasicAttribute.Strength, BasicAttribute.Resistance]);
  });

  it("should log an error if handleAllBuffInParty fails", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    // @ts-ignore
    jest.spyOn(partyBuff, "handleCharacterBuffSkill").mockRejectedValue(new Error("Buff error"));

    const party: ICharacterParty = {
      leader: characterLeader,
      // @ts-ignore
      members: [firstMember, secondMember],
      size: 3,
    };

    await partyBuff.handleAllBuffInParty(party, true);

    expect(spy).toHaveBeenCalledWith("Error applying buff from party:", expect.any(Error));

    spy.mockRestore();
  });
});
