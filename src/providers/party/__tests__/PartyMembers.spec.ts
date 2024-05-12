import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterClass, UISocketEvents } from "@rpg-engine/shared";
import { PartyCRUD } from "../PartyCRUD";
import PartyInvitation from "../PartyInvitation";
import { PartyMembers } from "../PartyMembers";
import { ICharacterParty } from "../PartyTypes";
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
    const party = (await partyInvitation.acceptInvite(characterLeader, firstMember)) as ICharacterParty;

    expect(party).toBeDefined();

    const success = await partyMembers.transferLeadership(party?._id, firstMember, characterLeader);

    expect(success).toBeTruthy();

    const updatedParty = (await partyCRUD.findById(party?._id)) as ICharacterParty;

    expect(partyValidator.checkIfIsLeader(updatedParty, characterLeader)).toBeFalsy();

    expect(partyValidator.checkIfIsLeader(updatedParty, firstMember)).toBeTruthy();

    expect(partyValidator.checkIfInParty(updatedParty, characterLeader)).toBeTruthy();
  });

  it("should transfer leadership and remove the old leader", async () => {
    await partyInvitation.acceptInvite(characterLeader, firstMember);
    const party = (await partyInvitation.acceptInvite(characterLeader, secondMember)) as ICharacterParty;

    expect(party).toBeDefined;

    let success = await partyMembers.transferLeadership(party?._id, firstMember, characterLeader);

    expect(success).toBeTruthy;

    success = await partyMembers.leaveParty(party?._id, characterLeader, firstMember);
    expect(success).toBeTruthy;

    const updatedParty = (await partyCRUD.findById(party?._id)) as ICharacterParty;

    expect(partyValidator.checkIfIsLeader(updatedParty, characterLeader)).toBeFalsy();

    expect(partyValidator.checkIfIsLeader(updatedParty, firstMember)).toBeTruthy();

    expect(partyValidator.checkIfInParty(updatedParty, characterLeader)).toBeFalsy();

    expect(partyValidator.checkIfIsLeader(updatedParty, characterLeader)).toBeFalsy();
  });

  it("should allow a leader to remove a member", async () => {
    await partyInvitation.acceptInvite(characterLeader, firstMember);
    const party = (await partyInvitation.acceptInvite(characterLeader, secondMember)) as ICharacterParty;

    expect(party).toBeDefined;

    const success = await partyMembers.leaveParty(party?._id, firstMember, characterLeader);

    expect(success).toBeTruthy;

    const updatedParty = (await partyCRUD.findById(party?._id)) as ICharacterParty;

    expect(partyValidator.checkIfInParty(updatedParty, firstMember)).toBeFalsy();

    expect(sendMessageToAllMembers).toHaveBeenCalledWith(`${firstMember.name} has left the party!`, expect.anything());
  });

  it("should not allow a leader to remove themselves", async () => {
    const party = (await partyInvitation.acceptInvite(characterLeader, firstMember)) as ICharacterParty;

    expect(party).toBeDefined;

    await partyMembers.leaveParty(party?._id, characterLeader, characterLeader);

    expect(sendEventToUser).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
      message: "You must transfer the leadership of the party before leaving!",
      type: "info",
    });
  });

  it("should allow a leader to remove themselves and close party", async () => {
    const party = (await partyInvitation.acceptInvite(characterLeader, firstMember)) as ICharacterParty;

    expect(party).toBeDefined;

    await partyMembers.transferLeadership(party?._id, firstMember, characterLeader);

    expect(sendMessageToAllMembers).toHaveBeenCalledWith(
      `Leadership has been transferred to ${firstMember.name}!`,
      expect.anything()
    );

    const success = await partyMembers.leaveParty(party?._id, characterLeader, firstMember);

    expect(success).toBeTruthy();

    const updatedParty = (await partyCRUD.findById(party?._id)) as ICharacterParty;

    expect(updatedParty).toBeFalsy();
  });

  it("should not allow a leader to remove a character that's not in the party", async () => {
    const party = (await partyInvitation.acceptInvite(characterLeader, firstMember)) as ICharacterParty;

    expect(party).toBeDefined;

    await partyMembers.leaveParty(party?._id, characterLeader, thirdMember);

    expect(sendEventToUser).toHaveBeenCalledWith(characterLeader.channelId!, UISocketEvents.ShowMessage, {
      message: "You can't remove other members from the party!",
      type: "info",
    });
  });

  it("should allow a non-leader member to leave the party", async () => {
    await partyCRUD.createParty(characterLeader, firstMember);
    const party = (await partyInvitation.acceptInvite(characterLeader, secondMember)) as ICharacterParty;

    expect(party).toBeDefined;

    const success = await partyMembers.leaveParty(party?._id, firstMember, firstMember);

    expect(success).toBeTruthy;

    const updatedParty = (await partyCRUD.findById(party?._id)) as ICharacterParty;

    expect(partyValidator.checkIfInParty(updatedParty, firstMember)).toBeFalsy();

    expect(sendMessageToAllMembers).toHaveBeenCalledWith(`${firstMember.name} has left the party!`, expect.anything());
  });

  it("should not allow a non-leader member to remove other member", async () => {
    await partyCRUD.createParty(characterLeader, firstMember);
    const party = (await partyInvitation.acceptInvite(characterLeader, secondMember)) as ICharacterParty;

    expect(party).toBeDefined;

    await partyMembers.leaveParty(party?._id, characterLeader, firstMember);

    expect(sendEventToUser).toHaveBeenCalledWith(characterLeader.channelId!, UISocketEvents.ShowMessage, {
      message: "You can't remove other members from the party!",
      type: "info",
    });
  });
  // END LEAVE PARTY TESTS

  it("should not allow leader to transfer leadership to a character not in the same party", async () => {
    const party = (await partyInvitation.acceptInvite(characterLeader, firstMember)) as ICharacterParty;

    expect(party).toBeDefined;

    const success = await partyMembers.transferLeadership(party?._id, secondMember, characterLeader);

    expect(success).toBeTruthy;

    expect(sendEventToUser).toHaveBeenCalledWith(characterLeader.channelId!, UISocketEvents.ShowMessage, {
      message: `${secondMember.name} is not in your party!`,
      type: "info",
    });
  });

  describe("Edge cases", () => {
    it("If a member that's a leader leaves the party, he should transfer the leadership before leaving", async () => {
      // @ts-ignore
      const transferLeadershipSpy = jest.spyOn(partyMembers, "transferLeadership");

      (await partyInvitation.acceptInvite(characterLeader, firstMember)) as ICharacterParty;
      const party = (await partyInvitation.acceptInvite(characterLeader, secondMember)) as ICharacterParty;

      expect(party).toBeTruthy();

      const result = await partyMembers.removeMemberFromParty(party, characterLeader);

      expect(result).toBeTruthy();

      expect(transferLeadershipSpy).toHaveBeenCalled();

      const updatedParty = await partyCRUD.findById(party._id);

      expect(updatedParty).toBeTruthy();

      expect(updatedParty?.leader._id.toString()).toStrictEqual(firstMember._id.toString());

      expect(updatedParty?.members).toHaveLength(1);
    });
  });
});
