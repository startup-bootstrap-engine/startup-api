import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { CharacterSocketEvents, ICharacterAttributeChanged } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

export interface ITextureRevert {
  originalTextureKey: string;
  expiresAt: number;
}

@provide(CharacterTextureChange)
export class CharacterTextureChange {
  constructor(private inMemoryHashTable: InMemoryHashTable, private socketMessaging: SocketMessaging) {}

  public async updateCharacterTexture(id: string, textureKey: string): Promise<ICharacter> {
    return await Character.findByIdAndUpdate(id, { textureKey }, { new: true })
      .select("_id textureKey channelId")
      .lean();
  }

  public async revertTexture(characterId: string, namespace: string): Promise<void> {
    const textures = await this.inMemoryHashTable.get("character-texture-revert", characterId);

    if (!textures || !textures[namespace]) {
      return;
    }

    const { originalTextureKey } = textures[namespace];
    const character = await Character.findById(characterId).lean<ICharacter>();

    if (!character) {
      return;
    }

    await this.updateCharacterTexture(characterId, originalTextureKey);
    const payload: ICharacterAttributeChanged = this.createPayload(character, originalTextureKey);

    await this.socketMessaging.sendEventToCharactersAroundCharacter(
      character,
      CharacterSocketEvents.AttributeChanged,
      payload,
      true
    );

    // Clean up the namespace entry atomically
    delete textures[namespace];

    if (Object.keys(textures).length === 0) {
      // If no more textures remain, remove the entire entry
      await this.inMemoryHashTable.delete("character-texture-revert", characterId);
    } else {
      // Otherwise, update the entry with the remaining textures
      await this.inMemoryHashTable.set("character-texture-revert", characterId, textures);
    }
  }

  public async changeTexture(
    character: ICharacter,
    textureKey: string,
    intervalInSecs: number,
    spell?: string
  ): Promise<void> {
    const namespace = spell || "spell";
    const key: string = character._id.toString();
    const normalTextureKey = character.textureKey;
    const spellType = "SpellType";

    try {
      const updatedCharacter = await this.updateCharacterTexture(character._id, textureKey);
      const payload: ICharacterAttributeChanged = this.createPayload(updatedCharacter, textureKey);

      await this.socketMessaging.sendEventToCharactersAroundCharacter(
        character,
        CharacterSocketEvents.AttributeChanged,
        payload,
        true
      );
      this.socketMessaging.sendMessageToCharacter(
        character,
        `You've morphed into a ${textureKey} for ${intervalInSecs} seconds!`
      );

      let hasSpell: boolean = false;
      const spellTypeStored = await this.inMemoryHashTable.getAll("SpellType");

      if (spellTypeStored) {
        for (const spellKey of Object.keys(spellTypeStored)) {
          const spell = await this.inMemoryHashTable.has(spellKey, key);
          if (spell) {
            hasSpell = true;
            break; // break the loop if a spell is found
          }
        }
      }

      if (!hasSpell) {
        await this.inMemoryHashTable.set(namespace, key, normalTextureKey);
        await this.inMemoryHashTable.set(spellType, namespace, true);
      }

      const currentTexturesToRevert =
        (await this.inMemoryHashTable.get("character-texture-revert", character._id)) || {};

      const textureRevert: ITextureRevert = {
        originalTextureKey: normalTextureKey,
        expiresAt: Date.now() + intervalInSecs * 1000,
      };

      // we store it on redis so we can revert it later on the cron job as well (fallback mechanism in case the server crashes/restart and setTimeout is wiped out)

      const redisPayload = {
        ...currentTexturesToRevert,
        [namespace]: textureRevert,
      };

      await this.inMemoryHashTable.set("character-texture-revert", character._id, redisPayload);

      // Set a timeout for immediate reversion
      setTimeout(() => this.revertTexture(character._id, namespace), intervalInSecs * 1000);
    } catch (error) {
      console.error(`Error in texture change: ${character._id} `, error);
    }
  }

  public createPayload(character: ICharacter, textureKey: string): ICharacterAttributeChanged {
    return {
      targetId: character._id,
      textureKey,
      health: character.health,
      maxHealth: character.maxHealth,
      mana: character.mana,
      maxMana: character.maxMana,
    };
  }

  public async removeAllTextureChange(): Promise<void> {
    try {
      const spellTypeStored = await this.inMemoryHashTable.getAll("SpellType");
      await this.inMemoryHashTable.deleteAll("SpellType");

      if (!spellTypeStored) return;

      for (const key of Object.keys(spellTypeStored)) {
        const spellData = await this.inMemoryHashTable.getAll(key);
        await this.inMemoryHashTable.deleteAll(key);

        if (!spellData) continue;

        for (const spellKey of Object.keys(spellData)) {
          await this.updateCharacterTexture(spellKey, spellData[spellKey] as string);
        }
      }
    } catch (error) {
      console.error("An error occurred while removing all texture change:", error);
    }
  }
}
