import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterParty, ICharacterParty } from "@entities/ModuleCharacter/CharacterPartyModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { CharacterClass, ICharacterPartyShared, IUIShowMessage, UISocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { PartyBenefitsCalculator } from "./PartyBenefitsCalculator";
import { PartyBuff } from "./PartyBuff";
import { PartySocketMessaging } from "./PartySocketMessaging";

@provide(PartyCRUD)
export class PartyCRUD {
  constructor(
    private socketMessaging: SocketMessaging,
    private inMemoryHashTable: InMemoryHashTable,
    private partyBuff: PartyBuff,
    private partyBenefitsCalculator: PartyBenefitsCalculator,
    private partySocketMessaging: PartySocketMessaging
  ) {}

  @TrackNewRelicTransaction()
  public async getPartyByCharacterId(characterId: string): Promise<ICharacterParty | null> {
    const party = (await CharacterParty.findOne({
      $or: [
        {
          "leader._id": characterId,
        },
        {
          "members._id": characterId,
        },
      ],
    }).lean({ virtuals: true })) as ICharacterParty;

    return party || null;
  }

  public async createParty(
    leader: ICharacter,
    target: ICharacter,
    maxSize?: number
  ): Promise<ICharacterParty | undefined> {
    const targetIsInParty = await this.getPartyByCharacterId(target._id);
    if (targetIsInParty) {
      this.socketMessaging.sendEventToUser<IUIShowMessage>(leader.channelId!, UISocketEvents.ShowMessage, {
        message: `${target.name} already is in a party!`,
        type: "info",
      });

      return;
    }

    const finalMaxSize = typeof maxSize !== "undefined" ? Math.min(Math.max(maxSize, 2), 5) : 5;

    const benefits = this.partyBenefitsCalculator.calculatePartyBenefits(2, leader.class !== target.class ? 2 : 1);

    const createParty: ICharacterPartyShared = {
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
    };

    try {
      const party = await CharacterParty.create(createParty);

      if (party) {
        const isAdding = true;
        await this.partyBuff.handleAllBuffInParty(party, isAdding);
        const message = `${target.name} joined the party!`;
        await this.partySocketMessaging.sendMessageToAllMembers(message, party);

        await this.inMemoryHashTable.set("party-members", party._id.toString(), [leader._id, target._id]);

        return party;
      }

      return;
    } catch (error) {
      console.error(error);
    }
  }

  public async deleteParty(character: ICharacter): Promise<void> {
    const party = (await this.getPartyByCharacterId(character._id)) as ICharacterParty;
    if (!party) {
      this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
        message: "You are not in a party",
        type: "info",
      });
      return;
    }

    await this.partyBuff.handleAllBuffInParty(party, false);
    await CharacterParty.deleteOne({ _id: party._id });
    const updatedParty = (await CharacterParty.findById(party._id)) as ICharacterParty;
    await this.partySocketMessaging.partyPayloadSend(updatedParty);

    await this.inMemoryHashTable.delete("party-members", updatedParty._id.toString());
  }

  public async clearAllParties(): Promise<void> {
    const allPartys = (await CharacterParty.find({}).lean()) as ICharacterParty[];

    const removeTasks = allPartys.map(async (party) => {
      try {
        await this.partyBuff.handleAllBuffInParty(party, false);
        await CharacterParty.findByIdAndDelete(party._id);
      } catch (error) {
        console.log("Error removing party buffs", error);
      }
    });

    await Promise.all(removeTasks);

    await this.inMemoryHashTable.deleteAll("party-members");
  }
}
