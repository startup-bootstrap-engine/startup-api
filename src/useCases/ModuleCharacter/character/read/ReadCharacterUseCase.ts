import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { SpecialEffect } from "@providers/entityEffects/SpecialEffect";
import { CharacterRepository } from "@repositories/ModuleCharacter/CharacterRepository";
import { provide } from "inversify-binding-decorators";

@provide(ReadCharacterUseCase)
export class ReadCharacterUseCase {
  constructor(
    private characterRepository: CharacterRepository,
    private characterInventory: CharacterInventory,
    private specialEffect: SpecialEffect
  ) {}

  public async read(id: string, selectFields: string[]): Promise<ICharacter> {
    try {
      const modelQuery = Character.findOne({ _id: id });

      if (selectFields.length > 0) {
        return (await modelQuery.select(selectFields.join(" ")).lean()) as ICharacter;
      }

      const character = (await modelQuery.populate("owner").populate("skills").lean({
        virtuals: true,
        defaults: true,
      })) as ICharacter;

      if (!character) {
        throw new Error("Character not found!");
      }

      // Assuming specialEffect.getOpacity and characterInventory.getInventory return promises.
      const [alpha, inventory] = await Promise.all([
        this.specialEffect.getOpacity(character),
        this.characterInventory.getInventory(character),
      ]);

      const output = {
        ...character,
        alpha,
        inventory,
      } as unknown as ICharacter;

      console.log(output);

      return output;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async readAll(ownerId: string): Promise<ICharacter[]> {
    let characters: ICharacter[] = await this.characterRepository.readAll(
      Character,
      {
        owner: ownerId,
      },
      false,
      null,
      true
    );

    characters = characters.filter((char) => !char.isSoftDeleted);

    for (const char of characters) {
      const inventory = await this.characterInventory.getInventory(char);

      // @ts-ignore
      char.inventory = inventory;
    }

    return characters;
  }
}
