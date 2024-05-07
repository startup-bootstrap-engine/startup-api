import { CharacterBuff } from "@entities/ModuleCharacter/CharacterBuffModel";
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterBuffDurationType, CharacterClass, PartySocketEvents, UISocketEvents } from "@rpg-engine/shared";
import PartyManagement from "../PartyInvitation";

describe("Party Management", () => {
  let partyManagement: PartyManagement;
  let characterLeader: ICharacter;
  let firstMember: ICharacter;
  let secondMember: ICharacter;
  let thirdMember: ICharacter;
  let messageSpy: jest.SpyInstance;

  beforeAll(() => {
    partyManagement = container.get<PartyManagement>(PartyManagement);

    // @ts-ignore
    messageSpy = jest.spyOn(partyManagement.socketMessaging, "sendEventToUser");
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
    const addMemberToPartySpy = jest.spyOn(partyManagement, "addMemberToParty");

    const party = await partyManagement.acceptInvite(characterLeader, firstMember);

    await partyManagement.acceptInvite(characterLeader, secondMember);

    expect(addMemberToPartySpy).toHaveBeenCalledWith(characterLeader, secondMember);

    // @ts-ignore
    expect(partyManagement.checkIfInParty(party, characterLeader)).toBeTruthy();
  });

  it("should a leader be able to invite a character to the party", async () => {
    // @ts-ignore
    jest.spyOn(partyManagement.socketMessaging, "sendEventToUser" as any);

    const party = await partyManagement.acceptInvite(characterLeader, firstMember);

    expect(party).toBeDefined;

    // @ts-ignore
    expect(partyManagement.checkIfInParty(party, firstMember)).toBeTruthy();
    // @ts-ignore
    await partyManagement.inviteToParty(characterLeader, secondMember);

    expect(messageSpy).toHaveBeenCalledWith(secondMember.channelId!, PartySocketEvents.PartyInvite, {
      leaderId: characterLeader._id,
      leaderName: characterLeader.name,
    });
  });

  // LEAVE PARTY TESTS

  it("should not allow to invite a character that's already in a party", async () => {
    // @ts-ignore
    await partyManagement.createParty(characterLeader, secondMember);
    // @ts-ignore
    await partyManagement.inviteToParty(characterLeader, secondMember, characterLeader);

    // @ts-ignore
    expect(messageSpy).toHaveBeenCalledWith(characterLeader.channelId!, UISocketEvents.ShowMessage, {
      message: `${secondMember.name} already is in a party!`,
      type: "info",
    });
  });

  it("should not allow to invite a character when the party is full", async () => {
    // @ts-ignore
    const party = await partyManagement.createParty(characterLeader, firstMember, 2);

    expect(party).toBeDefined;

    // @ts-ignore
    await partyManagement.inviteToParty(characterLeader, secondMember);

    // @ts-ignore
    expect(partyManagement.areBothInSameParty(party, characterLeader, secondMember)).toBeFalsy();

    expect(messageSpy).toHaveBeenCalledWith(characterLeader.channelId!, UISocketEvents.ShowMessage, {
      message: "The party is already full!",
      type: "info",
    });
  });

  it("should add buffs to the party once only when call applyCharacterBuff", async () => {
    const trait = ["strength"];

    // @ts-ignore
    await partyManagement.applyCharacterBuff(characterLeader, trait, 2);
    // @ts-ignore
    await partyManagement.applyCharacterBuff(characterLeader, trait, 2);

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
    await partyManagement.applyCharacterBuff(characterLeader, trait, 2);

    // @ts-ignore
    await partyManagement.removeCharacterBuff(characterLeader, trait, 2);

    const partyBuffs = await CharacterBuff.find({
      owner: characterLeader._id,
      trait: trait[0],
      durationType: CharacterBuffDurationType.Permanent,
      originateFrom: "party",
    }).lean();

    expect(partyBuffs.length).toBe(0);
  });
});
