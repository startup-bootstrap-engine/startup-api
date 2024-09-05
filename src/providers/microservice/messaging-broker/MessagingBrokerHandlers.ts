import { appEnv } from "@providers/config/env";
import { NPCMovementMoveTowards } from "@providers/npc/movement/NPCMovementMoveTowards";
import { NPCManager } from "@providers/npc/NPCManager";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { provide } from "inversify-binding-decorators";

@provide(MessagingBrokerHandlers)
export class MessagingBrokerHandlers {
  constructor(
    private npcMovementMoveTowards: NPCMovementMoveTowards,
    private npcManager: NPCManager,
    private socketMessaging: SocketMessaging
  ) {}

  public async onAddHandlers(): Promise<void> {
    const { MICROSERVICE_NAME, IS_MICROSERVICE } = appEnv.general;

    if (!IS_MICROSERVICE) {
      await this.socketMessaging.addSendEventToUserListener();
    }

    switch (MICROSERVICE_NAME) {
      case "rpg-npc":
        console.log("💌 Adding messaging broker handlers");

        await this.npcMovementMoveTowards.addPathfindingResultsListener();
        await this.npcMovementMoveTowards.addLightweightPathfindingResultsListener();
        await this.npcManager.startBehaviorLoopListener();
        break;
    }
  }
}
