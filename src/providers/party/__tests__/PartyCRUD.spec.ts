import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterClass } from "@rpg-engine/shared";
import { PartyCRUD } from "../PartyCRUD";
import PartyInvitation from "../PartyInvitation";
import { ICharacterParty } from "../PartyTypes";
import { PartyValidator } from "../PartyValidator";

describe("PartyCRUD", () => {
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

  describe("Party Creation", () => {
    it("should create a party", async () => {
      const party = await partyInvitation.acceptInvite(characterLeader, firstMember);

      expect(party).toBeDefined;

      expect(partyValidator.checkIfInParty(party!, characterLeader)).toBeTruthy();

      expect(partyValidator.checkIfInParty(party!, firstMember)).toBeTruthy();
    });

    it("should create a party with a maximum size limit", async () => {
      const maxSize = 3;
      const newParty = (await partyCRUD.createParty(characterLeader, firstMember, maxSize)) as ICharacterParty;
      const party = await partyCRUD.findById(newParty._id);

      expect(party).toBeDefined();
      expect(party?.maxSize).toEqual(maxSize);
    });

    it("should create a party when leader is not in a party", async () => {
      const party = await partyInvitation.acceptInvite(firstMember, secondMember);

      expect(party).toBeDefined;

      expect(partyValidator.checkIfInParty(party!, firstMember)).toBeTruthy();

      expect(partyValidator.checkIfInParty(party!, secondMember)).toBeTruthy();

      expect(partyValidator.checkIfInParty(party!, characterLeader)).toBeFalsy();
    });
  });

  describe("Party Read", () => {
    it("should return a party if the character is the leader", async () => {
      await partyCRUD.createParty(characterLeader, firstMember);

      const party = await partyCRUD.findPartyByCharacterId(characterLeader._id);

      expect(party).toBeDefined();
      expect(party?.leader._id.toString()).toStrictEqual(characterLeader._id.toString());
    });

    it("should return a party if the character is a member", async () => {
      await partyInvitation.acceptInvite(characterLeader, firstMember);

      const party = await partyCRUD.findPartyByCharacterId(firstMember._id);

      expect(party).toBeDefined();
      expect(party?.members.some((member) => member._id.toString() === firstMember._id.toString())).toBeTruthy();
    });

    it("should return null if the character is not part of a party", async () => {
      const anotherParty = await partyCRUD.findPartyByCharacterId(thirdMember._id);

      expect(anotherParty).toBeNull();
    });
  });

  describe("Party Updates", () => {
    it("should update party details", async () => {
      const newParty = (await partyCRUD.createParty(characterLeader, firstMember)) as ICharacterParty;

      await partyCRUD.findByIdAndUpdate(newParty?._id, {
        leader: secondMember,
      });

      const party = await partyCRUD.findById(newParty._id);

      expect(party).toBeDefined();

      expect(party?.leader._id.toString()).toEqual(secondMember._id.toString());
    });

    it("should update party maximum size and benefits", async () => {
      const newParty = (await partyCRUD.createParty(characterLeader, firstMember)) as ICharacterParty;
      const updates = { maxSize: 10, benefits: [{ benefit: "experience", value: 50 }] } as Partial<ICharacterParty>;
      await partyCRUD.findByIdAndUpdate(newParty._id, updates);

      const party = await partyCRUD.findById(newParty._id);
      expect(party?.maxSize).toEqual(10);
      expect(party?.benefits).toEqual(expect.arrayContaining([{ benefit: "experience", value: 50 }]));
    });
  });

  describe("Party Deletion/Removal", () => {
    it("should delete a party", async () => {
      await partyCRUD.createParty(characterLeader, firstMember);
      await partyCRUD.deleteParty(characterLeader);

      const party = await partyCRUD.findById(characterLeader._id);
      expect(party).toBeFalsy();
    });
  });

  describe("Edge Cases", () => {
    it("should check if a character is already in a party before adding", async () => {
      await partyCRUD.createParty(characterLeader, firstMember);
      const result = await partyCRUD.createParty(characterLeader, firstMember);

      expect(result).toBeUndefined(); // Or check for a specific error message
    });
  });
});
