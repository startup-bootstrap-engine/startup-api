import { Pathfinding } from "@providers/map/pathfinding/Pathfinding";
import { provide } from "inversify-binding-decorators";

@provide(MessagingBrokerHandlers)
export class MessagingBrokerHandlers {
  constructor(private pathfinding: Pathfinding) {}

  public async onAddHandlers(): Promise<void> {
    console.log("💌 Adding messaging broker handlers...");
  }
}
