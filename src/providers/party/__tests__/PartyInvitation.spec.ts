/* eslint-disable no-unused-vars */
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterClass, PartySocketEvents, UISocketEvents } from "@rpg-engine/shared";
import { PartyCRUD } from "../PartyCRUD";
import PartyInvitation from "../PartyInvitation";
import { PartyMembers } from "../PartyMembers";
import { PartyValidator } from "../PartyValidator";

describe("PartyInvitation", () => {
  let characterLeader: ICharacter;
  let firstMember: ICharacter;
  let secondMember: ICharacter;
  let thirdMember: ICharacter;
  let messageSpy: jest.SpyInstance;

  let partyInvitation: PartyInvitation;
  let partyMembers: PartyMembers;
  let partyValidator: PartyValidator;
  let partyCRUD: PartyCRUD;

  beforeAll(() => {
    partyInvitation = container.get<PartyInvitation>(PartyInvitation);
    partyMembers = container.get<PartyMembers>(PartyMembers);
    partyValidator = container.get<PartyValidator>(PartyValidator);
    partyCRUD = container.get<PartyCRUD>(PartyCRUD);

    // @ts-ignore
    messageSpy = jest.spyOn(partyInvitation.socketMessaging, "sendEventToUser");
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

  it("should invite to party when leader is already in a party", async () => {
    // @ts-ignore
    const addMemberToPartySpy = jest.spyOn(partyInvitation, "addMemberToParty");

    const party = await partyInvitation.acceptInvite(characterLeader, firstMember);

    await partyInvitation.acceptInvite(characterLeader, secondMember);

    expect(addMemberToPartySpy).toHaveBeenCalledWith(characterLeader, secondMember);

    expect(partyValidator.checkIfInParty(party!, characterLeader)).toBeTruthy();
  });

  it("should a leader be able to invite a character to the party", async () => {
    // @ts-ignore
    jest.spyOn(partyInvitation.socketMessaging, "sendEventToUser" as any);

    const party = await partyInvitation.acceptInvite(characterLeader, firstMember);

    expect(party).toBeDefined;

    expect(partyValidator.checkIfInParty(party!, firstMember)).toBeTruthy();

    await partyInvitation.inviteToParty(characterLeader, secondMember);

    expect(messageSpy).toHaveBeenCalledWith(secondMember.channelId!, PartySocketEvents.PartyInvite, {
      leaderId: characterLeader._id,
      leaderName: characterLeader.name,
    });
  });

  it("should not allow to invite a character that's already in a party", async () => {
    await partyCRUD.createParty(characterLeader, secondMember);

    await partyInvitation.inviteToParty(characterLeader, secondMember);

    // @ts-ignore
    expect(messageSpy).toHaveBeenCalledWith(characterLeader.channelId!, UISocketEvents.ShowMessage, {
      message: `${secondMember.name} already is in a party!`,
      type: "info",
    });
  });

  it("should not allow to invite a character when the party is full", async () => {
    const party = await partyCRUD.createParty(characterLeader, firstMember, 2);

    expect(party).toBeDefined;

    await partyInvitation.inviteToParty(characterLeader, secondMember);

    expect(partyValidator.areBothInSameParty(party!, characterLeader, secondMember)).toBeFalsy();

    expect(messageSpy).toHaveBeenCalledWith(characterLeader.channelId!, UISocketEvents.ShowMessage, {
      message: "The party is already full!",
      type: "info",
    });
  });
});
