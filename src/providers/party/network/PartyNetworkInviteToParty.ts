import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { IPartyManagementFromClient, PartySocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import PartyInvitation from "../PartyInvitation";
import { PartySocketMessaging } from "../PartySocketMessaging";

@provide(PartyNetworkInviteToParty)
export class PartyNetworkInviteToParty {
  constructor(
    private socketAuth: SocketAuth,
    private partyInvitation: PartyInvitation,
    private partySocketMessaging: PartySocketMessaging,
    private socketMessaging: SocketMessaging
  ) {}

  public onInviteToParty(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      PartySocketEvents.PartyInvite,
      async (data: IPartyManagementFromClient, _character: ICharacter) => {
        try {
          const leader = (await Character.findById(data.leaderId).lean()) as ICharacter;
          if (!leader) {
            throw new Error("Error on invite to party, leader not found");
          }

          const target = (await Character.findById(data.targetId).lean()) as ICharacter;
          if (!target) {
            throw new Error("Error on invite to party, target not found");
          }

          await this.partyInvitation.inviteToParty(leader, target);
        } catch (error) {
          console.error(error);
        }
      }
    );

    this.socketAuth.authCharacterOn(
      channel,
      PartySocketEvents.AcceptInvite,
      async (data: IPartyManagementFromClient, _character: ICharacter) => {
        try {
          const leader = (await Character.findById(data.leaderId).lean()) as ICharacter;

          if (!leader) {
            throw new Error("Error on joining party, character leader not found");
          }

          const target = (await Character.findById(data.targetId).lean()) as ICharacter;
          if (!target) {
            throw new Error("Error on joining party, character target not found");
          }

          const party = await this.partyInvitation.acceptInvite(leader, target);

          if (party) {
            await this.partySocketMessaging.partyPayloadSend(party);
          }
        } catch (error) {
          console.error(error);
        }
      }
    );
  }
}
