import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { CharacterClass, IUIShowMessage, UISocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { PartyBenefitsCalculator } from "./PartyBenefitsCalculator";
import { PartyBuff } from "./PartyBuff";
import { PartySocketMessaging } from "./PartySocketMessaging";
import { ICharacterParty } from "./PartyTypes";

import { v4 as uuidv4 } from "uuid";

@provide(PartyCRUD)
export class PartyCRUD {
  constructor(
    private socketMessaging: SocketMessaging,
    private inMemoryHashTable: InMemoryHashTable,
    private partyBuff: PartyBuff,
    private partyBenefitsCalculator: PartyBenefitsCalculator,
    private partySocketMessaging: PartySocketMessaging
  ) {}

  public async createParty(
    leader: ICharacter,
    target: ICharacter,
    maxSize?: number
  ): Promise<ICharacterParty | undefined> {
    const targetIsInParty = await this.findPartyByCharacterId(target._id);
    if (targetIsInParty) {
      if (leader.channelId) {
        this.socketMessaging.sendEventToUser<IUIShowMessage>(leader.channelId, UISocketEvents.ShowMessage, {
          message: `${target.name} already is in a party!`,
          type: "info",
        });
      }
      return undefined;
    }

    const existingParty = await this.findPartyByCharacterId(leader._id);
    if (existingParty) {
      if (existingParty.members.length >= existingParty.maxSize) {
        if (leader.channelId) {
          this.socketMessaging.sendEventToUser<IUIShowMessage>(leader.channelId, UISocketEvents.ShowMessage, {
            message: "Your party is already full.",
            type: "error",
          });
        }
        return undefined;
      }

      // Attempt to add new member to the existing party
      if (!existingParty.members.some((member) => member._id === target._id)) {
        existingParty.members.push({
          _id: target._id,
          class: target.class as CharacterClass,
          name: target.name,
        });
        existingParty.size = existingParty.members.length;

        await this.inMemoryHashTable.set("character-party", leader._id, existingParty);

        const message = `${target.name} joined the party!`;
        await this.partySocketMessaging.sendMessageToAllMembers(message, existingParty);

        return existingParty;
      }
      return undefined; // If the target is already a member, do nothing
    }

    // If no existing party, create a new one
    const finalMaxSize = typeof maxSize !== "undefined" ? Math.min(Math.max(maxSize, 2), 5) : 5;
    const benefits = this.partyBenefitsCalculator.calculatePartyBenefits(2, leader.class !== target.class ? 2 : 1);

    const newPartyId = uuidv4();

    const newParty: ICharacterParty = {
      _id: newPartyId,
      leader: {
        _id: leader._id,
        class: leader.class as CharacterClass,
        name: leader.name,
      },
      members: [
        {
          _id: target._id,
          class: target.class as CharacterClass,
          name: target.name,
        },
      ],
      maxSize: finalMaxSize,
      benefits,
      size: 2,
    };

    try {
      await this.inMemoryHashTable.set("character-party", newPartyId, newParty);

      const message = `${target.name} joined the party!`;
      await this.partySocketMessaging.sendMessageToAllMembers(message, newParty);

      return newParty;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to create party");
    }
  }

  public async findById(partyId: string): Promise<ICharacterParty | undefined> {
    return (await this.inMemoryHashTable.get("character-party", partyId)) as ICharacterParty;
  }

  public async findByIdAndUpdate(
    partyId: string,
    partyUpdate: Partial<ICharacterParty>
  ): Promise<ICharacterParty | undefined> {
    try {
      const oldParty = (await this.inMemoryHashTable.get("character-party", partyId)) as ICharacterParty;
      if (!oldParty) {
        console.error("Party not found");
        return undefined;
      }

      if (partyUpdate._id) {
        delete partyUpdate._id;
      }

      const updatedParty = {
        ...oldParty,
        ...partyUpdate,
      };

      await this.inMemoryHashTable.set("character-party", partyId, updatedParty);

      return updatedParty;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update party");
    }
  }

  @TrackNewRelicTransaction()
  public async findPartyByCharacterId(characterId: string): Promise<ICharacterParty | null> {
    const allParties = await this.inMemoryHashTable.getAll("character-party");

    if (!allParties) return null;

    const parties = Object.values(allParties) as ICharacterParty[];

    // eslint-disable-next-line mongoose-lean/require-lean
    const party = parties.find(
      (party) =>
        party.leader._id.toString() === characterId.toString() ||
        party.members.some((member) => member._id.toString() === characterId.toString())
    );

    return party || null;
  }

  public async deleteParty(character: ICharacter): Promise<void> {
    const party = await this.findPartyByCharacterId(character._id);
    if (!party) {
      if (character.channelId) {
        this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId, UISocketEvents.ShowMessage, {
          message: "You are not in a party",
          type: "info",
        });
      }
      return;
    }

    try {
      await this.partyBuff.handleAllBuffInParty(party, false);
      await this.inMemoryHashTable.delete("character-party", party._id);

      // Sending message to remaining members
      const message = "Party has been disbanded!";
      await this.partySocketMessaging.sendMessageToAllMembers(message, party);

      // Notify the character
      if (character.channelId) {
        const charactersIds: string[] = [];
        charactersIds.push(party.leader._id);

        for (const member of party.members) {
          charactersIds.push(member._id);
        }

        await this.partySocketMessaging.notifyPartyDisbanded(charactersIds);
      }
    } catch (error) {
      console.error("Failed to delete party:", error);
      throw new Error("Failed to delete party");
    }
  }

  public async clearAllParties(): Promise<void> {
    const partiesData = await this.inMemoryHashTable.getAll("character-party");

    if (!partiesData) {
      console.log("No parties found to clear.");
      return;
    }

    const allParties = Object.values(partiesData as Record<string, ICharacterParty>) as ICharacterParty[];

    const removeTasks = allParties.map(async (party) => {
      try {
        await this.partyBuff.handleAllBuffInParty(party, false);
        await this.inMemoryHashTable.delete("character-party", party._id);
      } catch (error) {
        console.log("Error removing party buffs", error);
      }
    });

    await Promise.all(removeTasks);
  }
}
