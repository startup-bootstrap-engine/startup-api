import { provide } from "inversify-binding-decorators";

@provide(RedisPubSubListeners)
export class RedisPubSubListeners {
  constructor() {}

  public async addSubscribers(): Promise<void> {}
}
