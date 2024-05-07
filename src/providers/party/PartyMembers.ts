import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterParty, ICharacterParty } from "@entities/ModuleCharacter/CharacterPartyModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterLastAction } from "@providers/character/CharacterLastAction";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { CharacterClass, IUIShowMessage, UISocketEvents } from "@rpg-engine/shared";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";
import { PartyBenefitsCalculator } from "./PartyBenefitsCalculator";
import { PartyBuff } from "./PartyBuff";
import { PartyCRUD } from "./PartyCRUD";
import { PartyClasses } from "./PartyClasses";
import { PartySocketMessaging } from "./PartySocketMessaging";
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
      return false;
    }

    let isAdding = false;
    await this.partyBuff.handleAllBuffInParty(party, isAdding);

    party.members = party.members.filter((member) => member._id.toString() !== character._id.toString());

    const partySize = party.size || party.members.length + 1;
    party.benefits = this.partyBenefitsCalculator.calculatePartyBenefits(
      partySize,
      this.partyClasses.getDifferentClasses(party)
    );

    if (party.members.length === 0) {
      await this.partyCRUD.deleteParty(character._id);
      const message = "Party Deleted!";
      await this.partySocketMessaging.sendMessageToAllMembers(message, party);

      await this.partySocketMessaging.partyPayloadSend(null, [character._id, party.leader._id]);

      return true;
    }

    const updatedParty = (await CharacterParty.findByIdAndUpdate(party._id, party, { new: true })) as ICharacterParty;

    isAdding = true;
    await this.partyBuff.handleAllBuffInParty(updatedParty, isAdding);

    const message = `${character.name} has left the party!`;
    await this.partySocketMessaging.sendMessageToAllMembers(message, updatedParty);

    await this.partySocketMessaging.partyPayloadSend(updatedParty);
    await this.partySocketMessaging.partyPayloadSend(null, [character._id]);

    await this.inMemoryHashTable.set(
      "party-members",
      updatedParty._id.toString(),
      updatedParty.members.map((member) => member._id)
    );

    return true;
  }

  @TrackNewRelicTransaction()
  public async removeInactivePartyMembers(partyId: string): Promise<void> {
    try {
      const party = await CharacterParty.findById(partyId).lean();

      if (party) {
        const currentTime = dayjs();
        const INACTIVITY_LIMIT_MS = 180000;

        const inactiveMembers: ICharacter[] = [];

        for (const member of party.members) {
          const lastAction = await this.characterLastAction.getLastAction(member._id as string);
          if (!lastAction || currentTime.diff(dayjs(lastAction), "milliseconds") > INACTIVITY_LIMIT_MS) {
            inactiveMembers.push(member as ICharacter);
          }
        }

        for (const inactiveMember of inactiveMembers) {
          const removed = await this.removeMemberFromParty(party as ICharacterParty, inactiveMember as ICharacter);

          if (removed) {
            this.socketMessaging.sendEventToUser<IUIShowMessage>(
              (inactiveMember as ICharacter).channelId!,
              UISocketEvents.ShowMessage,
              {
                message: "You were removed from the party due to inactivity",
                type: "info",
              }
            );
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
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

  public async leaveParty(partyId: string, targetOfEvent: ICharacter, eventCaller: ICharacter): Promise<boolean> {
    const party = (await CharacterParty.findById(partyId).lean().select("_id leader members")) as ICharacterParty;

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
