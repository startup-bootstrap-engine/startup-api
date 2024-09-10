import { provide } from "inversify-binding-decorators";

@provide(RedisStreamsListeners)
export class RedisStreamsListeners {
  constructor() {}

  public async addSubscribers(): Promise<void> {}
}
