import { CharacterValidation } from "@providers/character/CharacterValidation";
import { MAX_DISTANCE_TO_NPC_IN_GRID } from "@providers/constants/DepotConstants";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { DepotSocketEvents, IDepotContainerWithdraw } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { DepotSystem } from "../DepotSystem";
import { WithdrawItem } from "../WithdrawItem";

@provide(DepotNetworkWithdraw)
export class DepotNetworkWithdraw {
  constructor(
    private socketAuth: SocketAuth,
    private movementHelper: MovementHelper,
    private socketMessaging: SocketMessaging,
    private characterValidation: CharacterValidation,
    private depotSystem: DepotSystem,
    private withdrawItem: WithdrawItem
  ) {}

  public onDepotContainerWithdraw(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      DepotSocketEvents.Withdraw,
      async (data: IDepotContainerWithdraw, character) => {
        try {
          // Check if character is alive and not banned
          const hasBasicValidation = this.characterValidation.hasBasicValidation(character);

          if (!hasBasicValidation) {
            return;
          }

          const npc = await this.depotSystem.npcBasicValidation(data.npcId);

          // Check if position is at npc's reach
          const isUnderRange = this.movementHelper.isUnderRange(
            character.x,
            character.y,
            npc.x,
            npc.y,
            MAX_DISTANCE_TO_NPC_IN_GRID
          );
          if (!isUnderRange) {
            this.socketMessaging.sendErrorMessageToCharacter(character, "NPC out of reach...");
            return;
          }

          await this.withdrawItem.withdraw(character, data);
        } catch (error) {
          console.error(error);
        }
      }
    );
  }
}
