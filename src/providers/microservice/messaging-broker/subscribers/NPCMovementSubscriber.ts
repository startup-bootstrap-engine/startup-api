import { provide } from "inversify-binding-decorators";

@provide(NPCMovementMessagingHandler)
export class NPCMovementMessagingHandler {
  public async handle(): Promise<void> {}
}
