import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterParty, ICharacterParty } from "@entities/ModuleCharacter/CharacterPartyModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterClass } from "@rpg-engine/shared";
import { PartyCRUD } from "../PartyCRUD";
import PartyInvitation from "../PartyInvitation";
import { PartyMembers } from "../PartyMembers";
import { PartyValidator } from "../PartyValidator";

describe("PartyMembers", () => {
  let partyCRUD: PartyCRUD;
  let partyInvitation: PartyInvitation;
  let partyValidator: PartyValidator;
  let partyMembers: PartyMembers;
  let characterLeader: ICharacter;
  let firstMember: ICharacter;
  let secondMember: ICharacter;
  let thirdMember: ICharacter;
  let sendEventToUser: jest.SpyInstance;
  let sendMessageToAllMembers: jest.SpyInstance;

  beforeAll(() => {
    partyCRUD = container.get<PartyCRUD>(PartyCRUD);
    partyInvitation = container.get<PartyInvitation>(PartyInvitation);
    partyValidator = container.get<PartyValidator>(PartyValidator);
    partyMembers = container.get<PartyMembers>(PartyMembers);

    // @ts-ignore
    sendMessageToAllMembers = jest.spyOn(partyMembers.partySocketMessaging, "sendMessageToAllMembers");

    // @ts-ignore
    sendEventToUser = jest.spyOn(partyMembers.socketMessaging, "sendEventToUser");
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

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("should transfer leadership without removing the old leader", async () => {
    const party = await partyInvitation.acceptInvite(characterLeader, firstMember);

    expect(party).toBeDefined;

    const success = await partyMembers.transferLeadership(party?._id, firstMember, characterLeader);

    expect(success).toBeTruthy;

    const updatedParty = (await CharacterParty.findById(party?._id).lean()) as ICharacterParty;

    expect(partyValidator.checkIfIsLeader(updatedParty, characterLeader)).toBeFalsy();

    expect(partyValidator.checkIfIsLeader(updatedParty, firstMember)).toBeTruthy();

    expect(partyValidator.checkIfInParty(updatedParty, characterLeader)).toBeTruthy();
  });

  it("should transfer leadership and remove the old leader", async () => {
    await partyInvitation.acceptInvite(characterLeader, firstMember);
    const party = await partyInvitation.acceptInvite(characterLeader, secondMember);

    expect(party).toBeDefined;

    let success = await partyMembers.transferLeadership(party?._id, firstMember, characterLeader);

    expect(success).toBeTruthy;

    success = await partyMembers.leaveParty(party?._id, characterLeader, firstMember);
    expect(success).toBeTruthy;

    const updatedParty = (await CharacterParty.findById(party?._id).lean()) as ICharacterParty;

    expect(partyValidator.checkIfIsLeader(updatedParty, characterLeader)).toBeFalsy();

    expect(partyValidator.checkIfIsLeader(updatedParty, firstMember)).toBeTruthy();

    expect(partyValidator.checkIfInParty(updatedParty, characterLeader)).toBeFalsy();

    expect(partyValidator.checkIfIsLeader(updatedParty, characterLeader)).toBeFalsy();
  });

  it("should allow a leader to remove a member", async () => {
    await partyInvitation.acceptInvite(characterLeader, firstMember);
    const party = await partyInvitation.acceptInvite(characterLeader, secondMember);

    expect(party).toBeDefined;

    const success = await partyMembers.leaveParty(party?._id, firstMember, characterLeader);

    expect(success).toBeTruthy;

    const updatedParty = (await CharacterParty.findById(party?._id).lean().select("leader members")) as ICharacterParty;

    expect(partyValidator.checkIfInParty(updatedParty, firstMember)).toBeFalsy();

    expect(sendMessageToAllMembers).toHaveBeenCalledWith(`${firstMember.name} has left the party!`, expect.anything());
  });

  it("should not allow a leader to remove themselves", async () => {
    const party = await partyInvitation.acceptInvite(characterLeader, firstMember);

    expect(party).toBeDefined;

    await partyMembers.leaveParty(party?._id, characterLeader, characterLeader);

    expect(sendEventToUser).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
      message: "You must transfer the leadership of the party before leaving!",
      type: "info",
    });
  });

  it("should allow a leader to remove themselves and close party", async () => {
    const party = await partyInvitation.acceptInvite(characterLeader, firstMember);

    expect(party).toBeDefined;

    await partyMembers.transferLeadership(party?._id, firstMember, characterLeader);

    expect(sendMessageToAllMembers).toHaveBeenCalledWith(
      `Leadership has been transferred to ${firstMember.name}!`,
      expect.anything()
    );
  });
});
