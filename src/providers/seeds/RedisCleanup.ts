import { SpecialEffect } from "@providers/entityEffects/SpecialEffect";
import { provide } from "inversify-binding-decorators";

@provide(RedisCleanup)
export class RedisCleanup {
  constructor(private specialEffect: SpecialEffect) {}

  public async seed(): Promise<void> {
    await this.specialEffect.cleanup();
  }
}
