import { appEnv } from "@providers/config/env";
import { NPCMovementMoveTowards } from "@providers/npc/movement/NPCMovementMoveTowards";
import { provide } from "inversify-binding-decorators";

@provide(MessagingBrokerHandlers)
export class MessagingBrokerHandlers {
  constructor(private npcMovementMoveTowards: NPCMovementMoveTowards) {}

  public async onAddHandlers(): Promise<void> {
    console.log("💌 Adding messaging broker handlers...");

    const { MICROSERVICE_NAME } = appEnv.general;

    switch (MICROSERVICE_NAME) {
      case "rpg-npc":
        await this.npcMovementMoveTowards.addPathfindingResultsListener();
        await this.npcMovementMoveTowards.addLightweightPathfindingResultsListener();
        break;
    }
  }
}
