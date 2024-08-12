import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { HealthRegen } from "@providers/character/characterPassiveHabilities/HealthRegen";
import { ManaRegen } from "@providers/character/characterPassiveHabilities/ManaRegen";
import { CharacterClass } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(CharacterCreateRegen)
export class CharacterCreateRegen {
  constructor(private warriorPassiveHabilities: HealthRegen, private manaRegen: ManaRegen) {}

  public async handleCharacterRegen(character: ICharacter): Promise<void> {
    if (!character) {
      return;
    }
    try {
      if (
        character.class === CharacterClass.Warrior ||
        character.class === CharacterClass.Berserker ||
        character.class === CharacterClass.Hunter
      ) {
        await this.warriorPassiveHabilities.startAutoRegenHealthHandler(character);
      }
      await this.manaRegen.autoRegenManaHandler(character);
    } catch (error) {
      console.error(`Error regenerating character ${character._id}: ${error}`);
    }
  }
}
