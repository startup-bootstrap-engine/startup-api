import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ManaRegen } from "@providers/character/characterPassiveHabilities/ManaRegen";
import { WarriorPassiveHabilities } from "@providers/character/characterPassiveHabilities/WarriorPassiveHabilities";
import { CharacterClass } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(CharacterCreateRegen)
export class CharacterCreateRegen {
  constructor(private warriorPassiveHabilities: WarriorPassiveHabilities, private manaRegen: ManaRegen) {}

  public async handleCharacterRegen(character: ICharacter): Promise<void> {
    if (!character) {
      return;
    }
    try {
      if (character.class === CharacterClass.Warrior) {
        await this.warriorPassiveHabilities.warriorAutoRegenHealthHandler(character);
      }
      await this.manaRegen.autoRegenManaHandler(character);
    } catch (error) {
      console.error(`Error regenerating character ${character._id}: ${error}`);
    }
  }
}
