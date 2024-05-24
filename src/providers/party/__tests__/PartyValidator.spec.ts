import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterClass } from "@rpg-engine/shared";
import { PartyCRUD } from "../PartyCRUD";
import PartyInvitation from "../PartyInvitation";
import { ICharacterParty } from "../PartyTypes";
import { PartyValidator } from "../PartyValidator";

describe("PartyValidator", () => {
  let partyCRUD: PartyCRUD;
  let partyInvitation: PartyInvitation;
  let partyValidator: PartyValidator;
  let characterLeader: ICharacter;
  let firstMember: ICharacter;
  let secondMember: ICharacter;
  let thirdMember: ICharacter;
  let messageSpy: jest.SpyInstance;

  beforeAll(() => {
    partyCRUD = container.get<PartyCRUD>(PartyCRUD);
    partyInvitation = container.get<PartyInvitation>(PartyInvitation);
    partyValidator = container.get<PartyValidator>(PartyValidator);

    // @ts-ignore
    messageSpy = jest.spyOn(partyCRUD.socketMessaging, "sendEventToUser");
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

    thirdMember = await unitTestHelper.createMockCharacter(
      {
        class: CharacterClass.Druid,
        name: "Third Member",
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

  it("should check if two characters are in the same party", async () => {
    await partyInvitation.acceptInvite(characterLeader, firstMember);
    const party = await partyInvitation.acceptInvite(characterLeader, thirdMember);

    // @ts-ignore
    const areInSameParty = partyValidator.areBothInSameParty(party, characterLeader, thirdMember);

    expect(areInSameParty).toBeTruthy();
  });

  it("should check if two characters are not in the same party", async () => {
    await partyInvitation.acceptInvite(characterLeader, firstMember);
    const party = await partyInvitation.acceptInvite(secondMember, thirdMember);

    // @ts-ignore
    const areInSameParty = partyValidator.areBothInSameParty(party, characterLeader, thirdMember);

    expect(areInSameParty).toBeFalsy();
  });

  it("should check leader in party", async () => {
    const party = (await partyInvitation.acceptInvite(characterLeader, firstMember)) as ICharacterParty;

    expect(party).toBeDefined;

    expect(partyValidator.checkIfIsLeader(party, characterLeader)).toBeTruthy();

    expect(partyValidator.checkIfIsLeader(party, firstMember)).toBeFalsy();
  });

  describe("PartyValidator - Edge Cases", () => {
    it("should return true when check if both characters are on same party", async () => {
      // @ts-ignore
      const party = await partyCRUD.createParty(characterLeader, firstMember, 2);

      expect(party).toBeDefined;

      // leader and member in same party
      const areBothOnSameParty1 = await partyValidator.checkIfCharacterAndTargetOnTheSameParty(
        characterLeader,
        firstMember
      );
      expect(areBothOnSameParty1).toBe(true);

      // member and leader in same party
      const areBothOnSameParty2 = await partyValidator.checkIfCharacterAndTargetOnTheSameParty(
        firstMember,
        characterLeader
      );
      expect(areBothOnSameParty2).toBe(true);
    });

    it("should return true if one member is the leader and the other is a member in the same party", async () => {
      await partyInvitation.acceptInvite(characterLeader, firstMember);
      const isInSameParty = await partyValidator.checkIfCharacterAndTargetOnTheSameParty(characterLeader, firstMember);
      expect(isInSameParty).toBe(true);
    });

    it("should return true if two members are in the same party", async () => {
      await partyInvitation.acceptInvite(characterLeader, firstMember);
      await partyInvitation.acceptInvite(characterLeader, secondMember);
      const isInSameParty = await partyValidator.checkIfCharacterAndTargetOnTheSameParty(firstMember, secondMember);
      expect(isInSameParty).toBe(true);
    });

    it("should return false if two characters are in different parties", async () => {
      await partyInvitation.acceptInvite(characterLeader, firstMember);
      await partyInvitation.acceptInvite(secondMember, thirdMember);
      const isInSameParty = await partyValidator.checkIfCharacterAndTargetOnTheSameParty(firstMember, thirdMember);
      expect(isInSameParty).toBe(false);
    });

    it("should return false if neither character is in a party", async () => {
      const isInSameParty = await partyValidator.checkIfCharacterAndTargetOnTheSameParty(firstMember, thirdMember);
      expect(isInSameParty).toBe(false);
    });

    it("should return false if one character is in a party and the other is not", async () => {
      await partyInvitation.acceptInvite(characterLeader, firstMember);
      const isInSameParty = await partyValidator.checkIfCharacterAndTargetOnTheSameParty(firstMember, thirdMember);
      expect(isInSameParty).toBe(false);
    });
  });
});
