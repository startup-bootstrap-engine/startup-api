import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  CharacterClass,
  CharacterPartyBenefits,
  ICharacterPartyShared,
  IUIShowMessage,
  PartySocketEvents,
  UISocketEvents,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { ICharacterParty } from "./PartyTypes";

@provide(PartySocketMessaging)
export class PartySocketMessaging {
  constructor(private socketMessaging: SocketMessaging) {}

  public async partyPayloadSend(party: ICharacterParty, charactersId?: string[]): Promise<void> {
    const allCharactersId = new Set<string>(charactersId ? [...charactersId] : []);

    allCharactersId.add(party.leader._id);
    party.members.forEach((member) => allCharactersId.add(member._id));
    const partyPayload = this.generateDataPayloadFromServer(party);

    const fetchCharacter = async (id: string): Promise<ICharacter> => {
      return (await Character.findById(id.toString()).lean().select("channelId")) as ICharacter;
    };

    const sendPayloadToCharacter = async (characterId: string): Promise<void> => {
      const character = await fetchCharacter(characterId);
      if (character && character.channelId) {
        this.socketMessaging.sendEventToUser<ICharacterPartyShared>(
          character.channelId,
          PartySocketEvents.PartyInfoOpen,
          partyPayload
        );
      }
    };

    await Promise.all(Array.from(allCharactersId).map(sendPayloadToCharacter));
  }

  public async notifyPartyDisbanded(charactersId: string[]): Promise<void> {
    const fetchCharacter = async (id: string): Promise<ICharacter> => {
      return (await Character.findById(id.toString()).lean().select("channelId")) as ICharacter;
    };

    const sendDisbandNotification = async (characterId: string): Promise<void> => {
      const character = await fetchCharacter(characterId);
      if (character && character.channelId) {
        this.socketMessaging.sendEventToUser<ICharacterPartyShared>(
          character.channelId,
          PartySocketEvents.PartyInfoOpen,
          null as any
        );
      }
    };

    await Promise.all(charactersId.map(sendDisbandNotification));
  }

  public async sendMessageToAllMembers(message: string, party: ICharacterParty): Promise<void> {
    if (!party.members || !party.leader) {
      throw new Error("Empty party to send Message or Data!");
    }

    const charactersIds = new Set<string>();
    charactersIds.add(party.leader._id);

    for (const member of party.members) {
      charactersIds.add(member._id);
    }

    for (const characterId of charactersIds) {
      const character = (await Character.findById(characterId).lean().select("channelId")) as ICharacter;

      this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
        message,
        type: "info",
      });
    }
  }

  // HELP FUNCTIONS

  public generateDataPayloadFromServer(party: ICharacterParty): ICharacterPartyShared | undefined {
    const convertedParty: ICharacterPartyShared = {
      id: party._id ? party._id.toString() : undefined,
      leader: {
        _id: party.leader._id.toString(),
        class: party.leader.class as CharacterClass,
        name: party.leader.name,
      },
      members: party.members.map((member) => ({
        _id: member._id.toString(),
        class: member.class as CharacterClass,
        name: member.name,
      })),
      maxSize: party.maxSize,
      size: party.size,
      benefits: party.benefits
        ? party.benefits.map((benefit) => ({
            benefit: benefit.benefit as CharacterPartyBenefits,
            value: benefit.value,
          }))
        : undefined,
    };

    return convertedParty || undefined;
  }
}
