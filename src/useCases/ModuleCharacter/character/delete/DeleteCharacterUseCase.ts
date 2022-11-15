import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { CharacterRepository } from "@repositories/ModuleCharacter/CharacterRepository";
import { provide } from "inversify-binding-decorators";

@provide(DeleteCharacterUseCase)
export class DeleteCharacterUseCase {
  constructor(private characterRepository: CharacterRepository) {}

  public async delete(id: string, ownerId: string): Promise<boolean> {
    let wasDeleted: boolean = false;

    const characterToDelete = (await this.characterRepository.readOne(Character, {
      _id: id,
    })) as ICharacter;

    // compare object ids
    if (!characterToDelete.owner.equals(ownerId)) {
      throw new BadRequestError("You cannot delete a character which is not yours!");
    }

    await characterToDelete
      .remove()
      .then(() => {
        wasDeleted = true;

        return wasDeleted;
      })
      .catch(() => {
        wasDeleted = false;

        return wasDeleted;
      });

    return wasDeleted;
  }
}
