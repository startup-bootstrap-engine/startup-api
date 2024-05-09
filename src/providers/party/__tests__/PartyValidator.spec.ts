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

  it("should return true when check if both characters are on same party", async () => {
    // @ts-ignore
    const party = await partyCRUD.createParty(characterLeader, firstMember, 2);

    expect(party).toBeDefined;

    const areBothOnSameParty = await partyValidator.checkIfCharacterAndTargetOnTheSameParty(
      characterLeader,
      firstMember
    );

    expect(areBothOnSameParty).toBe(true);
  });

  it("should check leader in party", async () => {
    const party = (await partyInvitation.acceptInvite(characterLeader, firstMember)) as ICharacterParty;

    expect(party).toBeDefined;

    expect(partyValidator.checkIfIsLeader(party, characterLeader)).toBeTruthy();

    expect(partyValidator.checkIfIsLeader(party, firstMember)).toBeFalsy();
  });
});
