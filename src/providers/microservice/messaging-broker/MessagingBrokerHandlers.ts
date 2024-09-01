import { provide } from "inversify-binding-decorators";
import { NPCMovementMessagingHandler } from "./subscribers/NPCMovementSubscriber";

@provide(MessagingBrokerHandlers)
export class MessagingBrokerHandlers {
  constructor(private npcMovementMessagingHandler: NPCMovementMessagingHandler) {}

  public async onAddHandlers(): Promise<void> {
    console.log("💌 Adding messaging broker handlers...");
    await this.npcMovementMessagingHandler.handle();
  }
}
