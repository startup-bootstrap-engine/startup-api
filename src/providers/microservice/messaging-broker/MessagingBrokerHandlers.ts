import { NPCMovementMoveTowards } from "@providers/npc/movement/NPCMovementMoveTowards";
import { provide } from "inversify-binding-decorators";

@provide(MessagingBrokerHandlers)
export class MessagingBrokerHandlers {
  constructor(private npcMovementMoveTowards: NPCMovementMoveTowards) {}

  public async onAddHandlers(): Promise<void> {
    console.log("💌 Adding messaging broker handlers...");

    await this.npcMovementMoveTowards.addPathfindingResultsListener();
  }
}
