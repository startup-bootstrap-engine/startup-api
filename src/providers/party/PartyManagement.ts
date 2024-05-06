import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterParty, ICharacterParty } from "@entities/ModuleCharacter/CharacterPartyModel";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { CharacterClass, IUIShowMessage, PartySocketEvents, UISocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { PartyBenefitsCalculator } from "./PartyBenefitsCalculator";
import { PartyBuff } from "./PartyBuff";
import { PartyCRUD } from "./PartyCRUD";
import { PartyMembers } from "./PartyMembers";
import { PartySocketMessaging } from "./PartySocketMessaging";
import { PartyValidator } from "./PartyValidator";

@provide(PartyManagement)
export default class PartyManagement {
  constructor(
    private socketMessaging: SocketMessaging,
    private inMemoryHashTable: InMemoryHashTable,
    private partyCRUD: PartyCRUD,
    private partyValidator: PartyValidator,
    private partyBenefitsCalculator: PartyBenefitsCalculator,
    private partyBuff: PartyBuff,
    private partySocketMessaging: PartySocketMessaging,
    private partyMembers: PartyMembers
  ) {}

  // PARTY MANAGEMENT

  public async inviteToParty(leader: ICharacter, target: ICharacter): Promise<void> {
    const isTargetInParty = await this.partyCRUD.getPartyByCharacterId(target._id);
    if (isTargetInParty) {
      this.socketMessaging.sendEventToUser<IUIShowMessage>(leader.channelId!, UISocketEvents.ShowMessage, {
        message: `${target.name} already is in a party!`,
        type: "info",
      });
      return;
    }

    if (!(await this.partyValidator.checkIfPartyHaveFreeSlots(leader))) {
      this.socketMessaging.sendEventToUser<IUIShowMessage>(leader.channelId!, UISocketEvents.ShowMessage, {
        message: "The party is already full!",
        type: "info",
      });
      return;
    }

    this.socketMessaging.sendEventToUser(target?.channelId!, PartySocketEvents.PartyInvite, {
      leaderId: leader._id,
      leaderName: leader.name,
    });

    this.socketMessaging.sendEventToUser<IUIShowMessage>(leader.channelId!, UISocketEvents.ShowMessage, {
      message: `Send invite to ${target.name}!`,
      type: "info",
    });
  }

  public async acceptInvite(leader: ICharacter, target: ICharacter): Promise<ICharacterParty | undefined> {
    const isPartyExist = await this.partyCRUD.getPartyByCharacterId(leader._id);

    const party: ICharacterParty | undefined = isPartyExist
      ? await this.addMemberToParty(leader, target)
      : await this.partyCRUD.createParty(leader, target);

    if (!party) {
      throw new Error("Error accept invite Party!");
    }

    return party;
  }

  private async addMemberToParty(leader: ICharacter, target: ICharacter): Promise<ICharacterParty | undefined> {
    const targetIsInParty = await this.partyCRUD.getPartyByCharacterId(target._id);
    if (targetIsInParty) {
      this.socketMessaging.sendEventToUser<IUIShowMessage>(leader.channelId!, UISocketEvents.ShowMessage, {
        message: `${target.name} already is in a party!`,
        type: "info",
      });

      return;
    }

    if (!(await this.partyValidator.checkIfPartyHaveFreeSlots(leader))) {
      this.socketMessaging.sendEventToUser<IUIShowMessage>(leader.channelId!, UISocketEvents.ShowMessage, {
        message: "The party is already full",
        type: "info",
      });

      return;
    }

    const party = (await this.partyCRUD.getPartyByCharacterId(leader._id)) as ICharacterParty;
    let isAdding = false;
    await this.partyBuff.handleAllBuffInParty(party, isAdding);

    party.members.push({
      _id: target._id,
      class: target.class as CharacterClass,
      name: target.name,
    });

    const benefits = this.partyBenefitsCalculator.calculatePartyBenefits(
      party.size + 1,
      this.partyMembers.getDifferentClasses(party)
    );

    const updatedParty = (await CharacterParty.findByIdAndUpdate(
      party._id,
      {
        members: party.members,
        benefits,
      },
      { new: true }
    )) as ICharacterParty;

    isAdding = true;
    await this.partyBuff.handleAllBuffInParty(updatedParty, isAdding);

    const message = `${target.name} joined the party!`;
    await this.partySocketMessaging.sendMessageToAllMembers(message, updatedParty);

    const partyMembers = updatedParty.members.map((member) => member._id.toString());

    await this.inMemoryHashTable.set("party-members", updatedParty._id.toString(), partyMembers);

    return updatedParty;
  }

  public async transferLeadership(partyId: string, target: ICharacter, eventCaller: ICharacter): Promise<boolean> {
    const party = (await CharacterParty.findById(partyId).lean().select("_id leader members")) as ICharacterParty;

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

    const updatedParty = (await CharacterParty.findByIdAndUpdate(party._id, party, { new: true })) as ICharacterParty;

    const message = `Leadership has been transferred to ${target.name}!`;
    await this.partySocketMessaging.sendMessageToAllMembers(message, updatedParty);

    await this.partySocketMessaging.partyPayloadSend(updatedParty);

    return true;
  }

  // SEND MESSAGE OR DATA

  // SERVER BOOTSTRAP
}
