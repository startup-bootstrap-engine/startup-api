import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { provideSingleton } from "@providers/inversify/provideSingleton";

export type CharacterMonitorCallback = (character: ICharacter) => void;
export type CallbackRecord = Record<string, CharacterMonitorCallback>;

//! Here we use a singleton pattern because the state cannot be recreated everytime a new instance is created (it needs to be a single instance)

@provideSingleton(CharacterMonitorCallbacks)
export class CharacterMonitorCallbacks {
  private charactersCallbacks = new Map<string, CallbackRecord>();

  public getCallback(character: ICharacter): CallbackRecord | undefined {
    if (!character._id) {
      throw new Error("Character ID is not provided.");
    }

    return this.charactersCallbacks.get(character._id.toString()) || {};
  }

  public getCallbackIds(character: ICharacter): string[] {
    if (!character._id) {
      throw new Error("Character ID is not provided.");
    }

    const currentCallbackRecord = this.charactersCallbacks.get(character._id.toString());

    if (!currentCallbackRecord) {
      return [];
    }

    return Object.keys(currentCallbackRecord) || [];
  }

  public setCallback(character: ICharacter, callbackId: string, callback: CharacterMonitorCallback): void {
    if (!character._id) {
      throw new Error("Character ID is not provided.");
    }

    const currentCallbackRecord = this.charactersCallbacks.get(character._id.toString());

    if (!currentCallbackRecord) {
      this.charactersCallbacks.set(character._id.toString(), {
        [callbackId]: callback,
      });
      return;
    }

    this.charactersCallbacks.set(character._id.toString(), {
      ...currentCallbackRecord,
      [callbackId]: callback,
    });
  }

  public deleteCallback(character: ICharacter, callbackId: string): void {
    if (!character._id || !callbackId) {
      throw new Error("Character ID or callback ID is not provided.");
    }

    const currentCallbackRecord = this.charactersCallbacks.get(character._id.toString());

    if (!currentCallbackRecord) {
      return;
    }

    delete currentCallbackRecord[callbackId];

    if (Object.keys(currentCallbackRecord).length === 0) {
      this.charactersCallbacks.delete(character._id.toString());
    }

    this.charactersCallbacks.set(character._id.toString(), currentCallbackRecord);
  }

  public deleteAllCallbacksFromCharacter(character: ICharacter): void {
    if (!character._id) {
      throw new Error("Character ID is not provided.");
    }

    this.charactersCallbacks.delete(character._id.toString());
  }
}
