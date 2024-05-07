import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterClass } from "@rpg-engine/shared";
import { PartyCRUD } from "../PartyCRUD";
import PartyInvitation from "../PartyInvitation";
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

  it("should create a party", async () => {
    const party = await partyInvitation.acceptInvite(characterLeader, firstMember);

    expect(party).toBeDefined;

    expect(partyValidator.checkIfInParty(party!, characterLeader)).toBeTruthy();

    expect(partyValidator.checkIfInParty(party!, firstMember)).toBeTruthy();
  });

  it("should return a party if the character is the leader", async () => {
    // @ts-ignore
    await partyCRUD.createParty(characterLeader, firstMember);

    const party = await partyCRUD.getPartyByCharacterId(characterLeader._id);

    expect(party).toBeDefined();
    expect(party?.leader._id).toEqual(characterLeader._id);
  });

  it("should return a party if the character is a member", async () => {
    await partyInvitation.acceptInvite(characterLeader, firstMember);

    const party = await partyCRUD.getPartyByCharacterId(firstMember._id);

    expect(party).toBeDefined();
    expect(party?.members.some((member) => member._id.toString() === firstMember._id.toString())).toBeTruthy();
  });

  it("should return null if the character is not part of a party", async () => {
    const anotherParty = await partyCRUD.getPartyByCharacterId(thirdMember._id);

    expect(anotherParty).toBeNull();
  });
});
