import { provide } from "inversify-binding-decorators";

@provide(MessagingBrokerHandlers)
export class MessagingBrokerHandlers {
  constructor() {}

  public async onAddHandlers(): Promise<void> {}
}
