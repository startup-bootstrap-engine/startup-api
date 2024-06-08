import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { MAGE_MANA_SHIELD_DAMAGE_REDUCTION } from "@providers/constants/BattleConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";

@provideSingleton(ManaShield)
export class ManaShield {
  constructor(
    private inMemoryHashTable: InMemoryHashTable,
    private socketMessaging: SocketMessaging,
    private lock: Locker
  ) {}

  @TrackNewRelicTransaction()
  public async handleManaShield(character: ICharacter, damage: number): Promise<boolean> {
    try {
      if (!character || character.mana === character.maxMana) {
        return false;
      }

      return await this.applyManaShield(character, damage);
    } catch (error) {
      console.error(`Failed to handle sorcerer mana shield: ${error}`);
      return false;
    }
  }

  @TrackNewRelicTransaction()
  public async hasManaShield(character: ICharacter): Promise<boolean> {
    const spell = await this.inMemoryHashTable.get("mana-shield", character._id);
    return !!spell;
  }

  @TrackNewRelicTransaction()
  private async applyManaShield(character: ICharacter, damage: number): Promise<boolean> {
    try {
      if (typeof damage !== "number" || isNaN(damage)) {
        throw new Error(`Invalid damage value: ${damage}`);
      }

      const canProceed = await this.lock.lock(`mana-shield-${character._id}`);

      if (!canProceed) {
        return false;
      }

      const newMana = character.mana - damage / MAGE_MANA_SHIELD_DAMAGE_REDUCTION;
      const excessDamage = Math.abs(Math.min(newMana, 0));
      const newHealth = character.health - excessDamage;

      if (newMana <= 0 && newHealth <= 0) {
        return false;
      }

      if (newMana <= 0) {
        await this.inMemoryHashTable.delete("mana-shield", character._id);
      }

      (await Character.findByIdAndUpdate(character._id, {
        mana: newMana > 0 ? newMana : 0,
        health: newMana < 0 ? Math.max(newHealth, 0) : character.health,
      }).lean()) as ICharacter;

      await this.socketMessaging.sendEventAttributeChange(character._id);

      return true;
    } catch (error) {
      console.error(`Failed to apply sorcerer mana shield: ${error} - ${character._id}`);
      return false;
    } finally {
      await this.lock.unlock(`mana-shield-${character._id}`);
    }
  }

  public async clearAllManaShields(): Promise<void> {
    await this.inMemoryHashTable.deleteAll("mana-shield");
  }
}
