import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { provide } from "inversify-binding-decorators";
import PartyManagement from "../PartyManagement";
import { IPartyManagementFromClient, PartySocketEvents } from "@rpg-engine/shared";

@provide(PartyNetworkLeave)
export class PartyNetworkLeave {
  constructor(private socketAuth: SocketAuth, private partyManagement: PartyManagement) {}

  public onLeaveParty(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      PartySocketEvents.LeaveParty,
      async (data: IPartyManagementFromClient, character: ICharacter) => {
        try {
          const leader = (await Character.findById(character._id).lean()) as ICharacter;

          if (!leader) {
            throw new Error("Error on leave party, character leader not found");
          }
          const target = (await Character.findById(data.targetId).lean()) as ICharacter;

          if (!target) {
            throw new Error("Error on leave party, character target not found");
          }

          await this.partyManagement.leaveParty(leader, target);
        } catch (error) {
          console.error(error);
        }
      }
    );
  }
}
