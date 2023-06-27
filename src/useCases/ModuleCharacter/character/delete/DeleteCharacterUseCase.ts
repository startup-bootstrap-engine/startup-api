import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { CharacterRESTRepository } from "@repositories/ModuleCharacter/CharacterRESTRepository";
import { provide } from "inversify-binding-decorators";

@provide(DeleteCharacterUseCase)
export class DeleteCharacterUseCase {
  constructor(private characterRESTRepository: CharacterRESTRepository) {}

  public async delete(id: string, ownerId: string): Promise<boolean> {
    let wasDeleted: boolean = false;

    const characterToDelete = (await this.characterRESTRepository.readOne(Character, {
      _id: id,
    })) as ICharacter;

    // compare object ids
    // @ts-ignore
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
