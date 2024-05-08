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
      this.socketMessaging.sendEventToUser<IUIShowMessage>(leader.channelId!, UISocketEvents.ShowMessage, {
        message: `${target.name} already is in a party!`,
        type: "info",
      });

      return;
    }

    const existingParty = await this.findPartyByCharacterId(leader._id);
    if (existingParty) {
      if (existingParty.members.length >= existingParty.maxSize) {
        this.socketMessaging.sendEventToUser<IUIShowMessage>(leader.channelId!, UISocketEvents.ShowMessage, {
          message: "Your party is already full.",
          type: "error",
        });

        return;
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
        await this.inMemoryHashTable.set(
          "party-members",
          existingParty._id.toString(),
          existingParty.members.map((member) => member._id)
        );

        const message = `${target.name} joined the party!`;
        await this.partySocketMessaging.sendMessageToAllMembers(message, existingParty);

        return existingParty;
      }

      return; // If the target is already a member, do nothing
    }

    // If no existing party, create a new one
    const finalMaxSize = typeof maxSize !== "undefined" ? Math.min(Math.max(maxSize, 2), 5) : 5;
    const benefits = this.partyBenefitsCalculator.calculatePartyBenefits(2, leader.class !== target.class ? 2 : 1);

    const newParty: ICharacterParty = {
      _id: leader._id,
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
      await this.inMemoryHashTable.set("character-party", leader._id, newParty);
      await this.inMemoryHashTable.set(
        "party-members",
        newParty._id.toString(),
        newParty.members.map((member) => member._id)
      );

      const message = `${target.name} joined the party!`;
      await this.partySocketMessaging.sendMessageToAllMembers(message, newParty);

      return newParty;
    } catch (error) {
      console.error(error);
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

      const updatedParty = {
        ...oldParty,
        ...partyUpdate,
      };

      await this.inMemoryHashTable.set("character-party", partyId, updatedParty);

      return updatedParty;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  @TrackNewRelicTransaction()
  public async findPartyByCharacterId(characterId: string): Promise<ICharacterParty | null> {
    const allParties = await this.inMemoryHashTable.getAll("character-party");

    if (!allParties) return null;

    const parties = Object.values(allParties) as ICharacterParty[];

    const party = parties.find(
      (party) =>
        party.leader._id === characterId.toString() ||
        party.members.some((member) => member._id === characterId.toString())
    );

    return party || null;
  }

  public async deleteParty(character: ICharacter): Promise<void> {
    const party = (await this.findPartyByCharacterId(character._id)) as ICharacterParty;
    if (!party) {
      this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
        message: "You are not in a party",
        type: "info",
      });
      return;
    }

    await this.partyBuff.handleAllBuffInParty(party, false);

    await this.inMemoryHashTable.delete("character-party", party._id);

    const updatedParty = (await this.inMemoryHashTable.get("character-party", character._id)) as ICharacterParty;

    await this.partySocketMessaging.partyPayloadSend(updatedParty);

    await this.inMemoryHashTable.delete("party-members", updatedParty?._id.toString());
  }

  public async clearAllParties(): Promise<void> {
    const allPartys = Object.values(
      (await this.inMemoryHashTable.getAll("character-party")) as Record<string, ICharacterParty>
    ) as ICharacterParty[];

    const removeTasks = allPartys.map(async (party) => {
      try {
        await this.partyBuff.handleAllBuffInParty(party, false);

        await this.inMemoryHashTable.delete("character-party", party._id);
      } catch (error) {
        console.log("Error removing party buffs", error);
      }
    });

    await Promise.all(removeTasks);

    await this.inMemoryHashTable.deleteAll("party-members");
  }
}
