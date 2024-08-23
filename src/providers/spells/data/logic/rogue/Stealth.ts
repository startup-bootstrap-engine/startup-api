import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { SpecialEffect, SpecialEffectNamespace } from "@providers/entityEffects/SpecialEffect";
import { npcManager } from "@providers/inversify/container";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { CharacterSocketEvents, ICharacterAttributeChanged } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(Stealth)
export class Stealth {
  private namespace = SpecialEffectNamespace.Stealth;

  constructor(
    private inMemoryHashTable: InMemoryHashTable,
    private socketMessaging: SocketMessaging,
    private specialEffect: SpecialEffect
  ) {}

  @TrackNewRelicTransaction()
  public async turnInvisible(target: ICharacter, intervalSec: number): Promise<boolean> {
    const applied = await this.specialEffect.applyEffect(target, target, intervalSec, this.namespace, async () => {
      await this.sendOpacityChange(target);
    });

    if (!applied) {
      return applied;
    }

    await this.sendOpacityChange(target);

    return applied;
  }

  @TrackNewRelicTransaction()
  public async turnVisible(target: ICharacter): Promise<boolean> {
    const applied = await this.specialEffect.removeEffect(target, this.namespace);

    if (!applied) {
      return applied;
    }

    await this.sendOpacityChange(target);

    await npcManager.startBehaviorLoopUsingMicroservice(target);

    return applied;
  }

  @TrackNewRelicTransaction()
  public async isInvisible(target: ICharacter | INPC): Promise<boolean> {
    return await this.specialEffect.isEffectApplied(target, this.namespace);
  }

  @TrackNewRelicTransaction()
  public async cleanup(): Promise<void> {
    await this.inMemoryHashTable.deleteAll(this.namespace);
  }

  @TrackNewRelicTransaction()
  public async getOpacity(target: ICharacter | INPC): Promise<number> {
    if (await this.isInvisible(target)) {
      return 0.3;
    }
    return 1;
  }

  private async sendOpacityChange(target: ICharacter): Promise<void> {
    const opacity = await this.getOpacity(target);
    const payload = {
      alpha: opacity,
      targetId: target._id,
    };

    this.socketMessaging.sendEventToUser<ICharacterAttributeChanged>(
      target.channelId!,
      CharacterSocketEvents.AttributeChanged,
      payload
    );

    await this.socketMessaging.sendEventToCharactersAroundCharacter(
      target,
      CharacterSocketEvents.AttributeChanged,
      payload
    );
  }
}
