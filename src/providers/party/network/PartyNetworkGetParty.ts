import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { IPartyManagementFromClient, PartySocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { PartyCRUD } from "../PartyCRUD";
import { PartySocketMessaging } from "../PartySocketMessaging";
import { ICharacterParty } from "../PartyTypes";

@provide(PartyNetworkGetParty)
export class PartyNetworkGetParty {
  constructor(
    private socketAuth: SocketAuth,
    private partySocketMessaging: PartySocketMessaging,
    private partyCRUD: PartyCRUD
  ) {}

  public onPartyPayloadSend(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      PartySocketEvents.PartyInfoRead,
      async (data: IPartyManagementFromClient, character: ICharacter) => {
        try {
          const { partyId, leaderId, targetId } = data;
          let party: ICharacterParty | null = null;

          if (partyId) {
            party = (await this.partyCRUD.findById(partyId)) as ICharacterParty;

            if (party) {
              await this.partySocketMessaging.partyPayloadSend(party);
              return;
            }
          }

          const characterId = leaderId || targetId || character._id;

          party = (await this.partyCRUD.findPartyByCharacterId(characterId)) as ICharacterParty;

          if (!party) {
            await this.partySocketMessaging.notifyPartyDisbanded([character._id]);
          } else {
            await this.partySocketMessaging.partyPayloadSend(party);
          }
        } catch (error) {
          console.error(error);
        }
      }
    );
  }
}
