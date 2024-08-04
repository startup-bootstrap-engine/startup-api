import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { CharacterClass, CharacterPartyBenefits, PartySocketEvents, UISocketEvents } from "@rpg-engine/shared";
import { PartySocketMessaging } from "../PartySocketMessaging";
import { ICharacterParty } from "../PartyTypes";

describe("PartySocketMessaging", () => {
  let partySocketMessaging: PartySocketMessaging;
  let socketMessaging: SocketMessaging;
  let characterLeader: ICharacter;
  let firstMember: ICharacter;
  let secondMember: ICharacter;
  let mockParty: ICharacterParty;

  beforeAll(() => {
    socketMessaging = container.get<SocketMessaging>(SocketMessaging);
    partySocketMessaging = new PartySocketMessaging(socketMessaging);
  });

  beforeEach(async () => {
    characterLeader = await unitTestHelper.createMockCharacter(
      { class: CharacterClass.Rogue },
      { hasEquipment: true, hasSkills: true, hasInventory: true }
    );
    firstMember = await unitTestHelper.createMockCharacter(
      { class: CharacterClass.Berserker },
      { hasEquipment: true, hasSkills: true, hasInventory: true }
    );
    secondMember = await unitTestHelper.createMockCharacter(
      { class: CharacterClass.Hunter },
      { hasEquipment: true, hasSkills: true, hasInventory: true }
    );

    mockParty = {
      _id: "party-id",
      leader: characterLeader,
      members: [firstMember as any, secondMember],
      maxSize: 3,
      size: 3,
      benefits: [{ benefit: CharacterPartyBenefits.Distribution, value: 2 }],
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("partyPayloadSend", () => {
    it("should send party payload to all members", async () => {
      const sendEventSpy = jest.spyOn(socketMessaging, "sendEventToUser");
      await partySocketMessaging.partyPayloadSend(mockParty);

      expect(sendEventSpy).toHaveBeenCalledTimes(3);
      [characterLeader, ...mockParty.members].forEach((member) => {
        expect(sendEventSpy).toHaveBeenCalledWith(
          (member as ICharacter).channelId,
          PartySocketEvents.PartyInfoOpen,
          expect.objectContaining({
            id: mockParty._id.toString(),
            leader: expect.objectContaining({ _id: characterLeader._id.toString() }),
            members: expect.arrayContaining([
              expect.objectContaining({ _id: firstMember._id.toString() }),
              expect.objectContaining({ _id: secondMember._id.toString() }),
            ]),
          })
        );
      });
    });

    it("should handle party with no members", async () => {
      const sendEventSpy = jest.spyOn(socketMessaging, "sendEventToUser");
      const emptyParty = { ...mockParty, members: [] };
      await partySocketMessaging.partyPayloadSend(emptyParty);

      expect(sendEventSpy).toHaveBeenCalledTimes(1);
      expect(sendEventSpy).toHaveBeenCalledWith(
        characterLeader.channelId,
        PartySocketEvents.PartyInfoOpen,
        expect.objectContaining({ members: [] })
      );
    });
  });

  describe("notifyPartyDisbanded", () => {
    it("should notify all members when a party is disbanded", async () => {
      const sendEventSpy = jest.spyOn(socketMessaging, "sendEventToUser");
      await partySocketMessaging.notifyPartyDisbanded([
        characterLeader._id.toString(),
        firstMember._id.toString(),
        secondMember._id.toString(),
      ]);

      expect(sendEventSpy).toHaveBeenCalledTimes(3);
      [characterLeader, firstMember, secondMember].forEach((member) => {
        expect(sendEventSpy).toHaveBeenCalledWith(member.channelId, PartySocketEvents.PartyInfoOpen, null);
      });
    });

    it("should handle empty list of character IDs", async () => {
      const sendEventSpy = jest.spyOn(socketMessaging, "sendEventToUser");
      await partySocketMessaging.notifyPartyDisbanded([]);

      expect(sendEventSpy).not.toHaveBeenCalled();
    });
  });

  describe("sendMessageToAllMembers", () => {
    it("should send a message to all party members", async () => {
      const sendEventSpy = jest.spyOn(socketMessaging, "sendEventToUser");
      const testMessage = "Test message";
      await partySocketMessaging.sendMessageToAllMembers(testMessage, mockParty);

      expect(sendEventSpy).toHaveBeenCalledTimes(3);
      [characterLeader, ...mockParty.members].forEach((member) => {
        expect(sendEventSpy).toHaveBeenCalledWith((member as ICharacter).channelId, UISocketEvents.ShowMessage, {
          message: testMessage,
          type: "info",
        });
      });
    });

    it("should throw an error for empty party", async () => {
      const emptyParty = { ...mockParty, members: [], leader: null };
      await expect(partySocketMessaging.sendMessageToAllMembers("Test", emptyParty as any)).rejects.toThrow(
        "Empty party"
      );
    });
  });

  describe("generateDataPayloadFromServer", () => {
    it("should generate the correct data payload from server", () => {
      const payload = partySocketMessaging.generateDataPayloadFromServer(mockParty);

      expect(payload).toEqual({
        id: mockParty._id.toString(),
        leader: {
          _id: characterLeader._id.toString(),
          class: characterLeader.class,
          name: characterLeader.name,
        },
        members: mockParty.members.map((member) => ({
          _id: member._id.toString(),
          class: member.class,
          name: member.name,
        })),
        maxSize: mockParty.maxSize,
        size: mockParty.size,
        benefits: mockParty.benefits.map((benefit) => ({
          benefit: benefit.benefit,
          value: benefit.value,
        })),
      });
    });

    it("should handle party without benefits", () => {
      const partyWithoutBenefits = { ...mockParty, benefits: undefined } as unknown as ICharacterParty;
      const payload = partySocketMessaging.generateDataPayloadFromServer(partyWithoutBenefits);

      expect(payload?.benefits).toBeUndefined();
    });

    it("should handle party without _id", () => {
      const partyWithoutId = { ...mockParty, _id: undefined } as unknown as ICharacterParty;
      const payload = partySocketMessaging.generateDataPayloadFromServer(partyWithoutId!);

      expect(payload?.id).toBeUndefined();
    });
  });
});
