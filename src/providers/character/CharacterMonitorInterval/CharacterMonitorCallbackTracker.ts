import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";

import { provide } from "inversify-binding-decorators";

interface ICharacterMonitorCallbacks {
  [callbackId: string]: boolean;
}

@provide(CharacterMonitorCallbackTracker)
export class CharacterMonitorCallbackTracker {
  constructor(private inMemoryHashTable: InMemoryHashTable) {}

  @TrackNewRelicTransaction()
  public async setCallback(character: ICharacter, callbackId: string): Promise<void> {
    const namespaceKey = "character-monitor-callbacks";

    const callbacks =
      (await this.inMemoryHashTable.get(namespaceKey, character._id)) ?? ({} as ICharacterMonitorCallbacks);

    callbacks[callbackId] = true;

    await this.inMemoryHashTable.set(namespaceKey, character._id, callbacks);
  }

  @TrackNewRelicTransaction()
  public async getCallback(character: ICharacter, callbackId: string): Promise<ICharacterMonitorCallbacks> {
    const namespaceKey = "character-monitor-callbacks";

    const callbacks =
      (await this.inMemoryHashTable.get(namespaceKey, character._id)) ?? ({} as ICharacterMonitorCallbacks);

    return callbacks[callbackId];
  }

  public async hasCallback(character: ICharacter, callbackId: string): Promise<boolean> {
    const namespaceKey = "character-monitor-callbacks";

    const callbacks =
      (await this.inMemoryHashTable.get(namespaceKey, character._id)) ?? ({} as ICharacterMonitorCallbacks);

    return !!callbacks[callbackId];
  }

  public async getCallbackIds(character: ICharacter): Promise<string[]> {
    const namespaceKey = "character-monitor-callbacks";

    const callbacks =
      (await this.inMemoryHashTable.get(namespaceKey, character._id)) ?? ({} as ICharacterMonitorCallbacks);

    return Object.keys(callbacks);
  }

  public async removeCallback(character: ICharacter, callbackId: string): Promise<void> {
    const namespaceKey = "character-monitor-callbacks";

    const callbacks =
      (await this.inMemoryHashTable.get(namespaceKey, character._id)) ?? ({} as ICharacterMonitorCallbacks);

    delete callbacks[callbackId];

    await this.inMemoryHashTable.set(namespaceKey, character._id, callbacks);
  }

  public async removeAllCallbacks(character: ICharacter): Promise<void> {
    const namespaceKey = "character-monitor-callbacks";

    await this.inMemoryHashTable.delete(namespaceKey, character._id);
  }

  public async clearAll(): Promise<void> {
    const namespaceKey = "character-monitor-callbacks";

    await this.inMemoryHashTable.deleteAll(namespaceKey);
  }
}
