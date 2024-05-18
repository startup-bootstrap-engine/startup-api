import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterLastAction } from "@providers/character/CharacterLastAction";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { CharacterClass, IUIShowMessage, UISocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { PartyBenefitsCalculator } from "./PartyBenefitsCalculator";
import { PartyBuff } from "./PartyBuff";
import { PartyCRUD } from "./PartyCRUD";
import { PartyClasses } from "./PartyClasses";
import { PartySocketMessaging } from "./PartySocketMessaging";
import { ICharacterParty } from "./PartyTypes";
import { PartyValidator } from "./PartyValidator";

@provide(PartyMembers)
export class PartyMembers {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterLastAction: CharacterLastAction,
    private partyCRUD: PartyCRUD,
    private inMemoryHashTable: InMemoryHashTable,
    private partyBuff: PartyBuff,
    private partyBenefitsCalculator: PartyBenefitsCalculator,
    private partyValidator: PartyValidator,
    private partySocketMessaging: PartySocketMessaging,
    private partyClasses: PartyClasses
  ) {}

  public async removeMemberFromParty(party: ICharacterParty, character: ICharacter): Promise<boolean> {
    if (!party) {
      throw new Error("Party not found!");
    }

    try {
      let message = `${character.name} has left the party!`;

      // check if member is a party leader. If so, transfer leadership before removing him
      const isLeader = this.partyValidator.checkIfIsLeader(party, character);

      if (isLeader) {
        const memberToTransferTo = await Character.findById(party.members[0]._id);

        if (memberToTransferTo) {
          message = `${character.name} has left the party! Leadership has been transferred to ${memberToTransferTo.name}!`;
          await this.transferLeadership(party._id, memberToTransferTo, character);
        }
      }

      party = (await this.partyCRUD.findById(party._id)) as ICharacterParty;

      await this.handleBuffBeforeRemovingMember(party);

      party.members = party.members.filter((member) => member._id.toString() !== character._id.toString());

      if (party.members.length === 0) {
        await this.deletePartyAndSendMessages(party, character);

        return true;
      }

      party.benefits = this.partyBenefitsCalculator.calculatePartyBenefits(
        party.size || party.members.length + 1,
        this.partyClasses.getDifferentClasses(party)
      );

      const updatedParty = await this.partyCRUD.findByIdAndUpdate(party._id, party);

      if (!updatedParty) {
        return false;
      }

      await this.handleBuffAfterRemovingMember(updatedParty);

      await this.partySocketMessaging.sendMessageToAllMembers(message, updatedParty);

      // updated character that left the party
      await this.partySocketMessaging.partyPayloadSend(updatedParty, [character._id]);

      // await this.partySocketMessaging.partyPayloadSend(null, [character._id]);

      return true;
    } catch (error) {
      console.error("Error while removing member from party:", error);
      return false;
    }
  }

  private async handleBuffBeforeRemovingMember(party: ICharacterParty): Promise<void> {
    await this.partyBuff.handleAllBuffInParty(party, false);
  }

  private async handleBuffAfterRemovingMember(party: ICharacterParty): Promise<void> {
    await this.partyBuff.handleAllBuffInParty(party, true);
  }

  private async deletePartyAndSendMessages(party: ICharacterParty, character: ICharacter): Promise<void> {
    await this.partyCRUD.deleteParty(character._id);
    const message = "Party has been disbanded!";
    await this.partySocketMessaging.sendMessageToAllMembers(message, party);

    await this.partySocketMessaging.partyPayloadSend(party);
  }

  public async transferLeadership(partyId: string, target: ICharacter, eventCaller: ICharacter): Promise<boolean> {
    const party = await this.partyCRUD.findById(partyId);

    if (!party) {
      return false;
    }

    const isLeader = this.partyValidator.checkIfIsLeader(party, eventCaller);

    if (!isLeader) {
      this.socketMessaging.sendEventToUser<IUIShowMessage>(eventCaller.channelId!, UISocketEvents.ShowMessage, {
        message: "You are not the party leader!",
        type: "info",
      });

      return false;
    }

    const inSameParty = this.partyValidator.areBothInSameParty(party, eventCaller, target);
    const isTargetSameParty = this.partyValidator.checkIfInParty(party, target);

    if (!isTargetSameParty || !inSameParty) {
      this.socketMessaging.sendEventToUser<IUIShowMessage>(eventCaller.channelId!, UISocketEvents.ShowMessage, {
        message: `${target.name} is not in your party!`,
        type: "info",
      });

      return false;
    }

    // if target is already leader, do nothing
    if (party.leader._id.toString() === target._id.toString()) {
      return false;
    }

    const members = party.members.filter((member) => member._id.toString() !== target._id.toString());

    party.members = members;
    party.members.push({
      _id: party.leader._id,
      class: party.leader.class as CharacterClass,
      name: party.leader.name,
    });

    party.leader = {
      _id: target._id,
      class: target.class as CharacterClass,
      name: target.name,
    };

    const updatedParty = await this.partyCRUD.findByIdAndUpdate(party._id, party);

    if (!updatedParty) {
      return false;
    }

    const message = `Leadership has been transferred to ${target.name}!`;
    await this.partySocketMessaging.sendMessageToAllMembers(message, updatedParty);

    await this.partySocketMessaging.partyPayloadSend(updatedParty);

    return true;
  }

  public async leaveParty(partyId: string, targetOfEvent: ICharacter, eventCaller: ICharacter): Promise<boolean> {
    const party = await this.partyCRUD.findById(partyId);

    if (!party) {
      throw new Error("Party not found!");
    }

    const isLeader = this.partyValidator.checkIfIsLeader(party, eventCaller);
    const isSameAsTarget = this.partyValidator.checkIfIsSameTarget(targetOfEvent._id, eventCaller._id);
    const isTargetInParty = this.partyValidator.checkIfInParty(party, targetOfEvent);

    let infoMessage = "";

    if (isLeader && isSameAsTarget) {
      infoMessage = "You must transfer the leadership of the party before leaving!";
    } else if (!isTargetInParty) {
      infoMessage = `${targetOfEvent.name} is not in your party!`;
    } else if (!isLeader && !isSameAsTarget) {
      infoMessage = "You can't remove other members from the party!";
    }

    if (infoMessage) {
      this.socketMessaging.sendEventToUser<IUIShowMessage>(eventCaller.channelId!, UISocketEvents.ShowMessage, {
        message: infoMessage,
        type: "info",
      });

      return false;
    }
    return await this.removeMemberFromParty(party, targetOfEvent);
  }
}
