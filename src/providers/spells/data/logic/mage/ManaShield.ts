import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { MAGE_MANA_SHIELD_DAMAGE_REDUCTION } from "@providers/constants/BattleConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SpellsBlueprint } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { NamespaceRedisControl } from "../../types/SpellsBlueprintTypes";

@provide(ManaShield)
export class ManaShield {
  constructor(private inMemoryHashTable: InMemoryHashTable, private socketMessaging: SocketMessaging) {}

  @TrackNewRelicTransaction()
  public async handleManaShield(character: ICharacter, damage: number): Promise<boolean> {
    try {
      if (!character || character.mana === character.maxMana) {
        return false;
      }

      const absorbed = await this.applyManaShield(character, damage);

      return absorbed;
    } catch (error) {
      console.error(`Failed to handle sorcerer mana shield: ${error}`);
      return false;
    }
  }

  @TrackNewRelicTransaction()
  public async getManaShieldSpell(character: ICharacter): Promise<boolean> {
    const namespace = `${NamespaceRedisControl.CharacterSpell}:${character._id}`;
    const key = SpellsBlueprint.ManaShield;
    const spell = await this.inMemoryHashTable.get(namespace, key);

    return !!spell;
  }

  @TrackNewRelicTransaction()
  private async applyManaShield(character: ICharacter, damage: number): Promise<boolean> {
    try {
      if (typeof damage !== "number" || isNaN(damage)) {
        throw new Error(`Invalid damage value: ${damage}`);
      }

      const newMana = character.mana - damage / MAGE_MANA_SHIELD_DAMAGE_REDUCTION;
      const newHealth = character.health + (newMana < 0 ? newMana : 0);

      if (newMana <= 0 && newHealth <= 0) {
        return false;
      }

      if (newMana <= 0) {
        const namespace = `${NamespaceRedisControl.CharacterSpell}:${character._id}`;
        const key = SpellsBlueprint.ManaShield;
        await this.inMemoryHashTable.delete(namespace, key);
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
    }
  }
}
