import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { IPartyManagementFromClient, PartySocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { PartyMembers } from "../PartyMembers";

@provide(PartyNetworkLeave)
export class PartyNetworkLeave {
  constructor(private socketAuth: SocketAuth, private partyMembers: PartyMembers) {}

  public onLeaveParty(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      PartySocketEvents.LeaveParty,
      async (data: IPartyManagementFromClient, character: ICharacter) => {
        try {
          const eventTarget = (await Character.findById(data.targetId).lean()) as ICharacter;

          if (!eventTarget) {
            throw new Error("Error on leave party, character leader not found");
          }

          const eventCaller = (await Character.findById(character._id).lean()) as ICharacter;
          if (!eventCaller) {
            throw new Error("Error on leave party, character eventCaller not found");
          }

          if (!data.partyId) {
            throw new Error("Error on leave party, partyId not found");
          }

          const success = await this.partyMembers.leaveParty(data.partyId, eventTarget, eventCaller);

          if (!success) {
            return;
          }
        } catch (error) {
          console.error(error);
        }
      }
    );
  }
}
