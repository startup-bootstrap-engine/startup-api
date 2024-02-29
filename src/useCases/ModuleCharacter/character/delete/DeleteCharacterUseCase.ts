import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { CharacterRepository } from "@repositories/ModuleCharacter/CharacterRepository";
import { provide } from "inversify-binding-decorators";
import { clearCacheForKey } from "speedgoose";

@provide(DeleteCharacterUseCase)
export class DeleteCharacterUseCase {
  constructor(private characterRepository: CharacterRepository, private inMemoryHashTable: InMemoryHashTable) {}

  public async delete(id: string, ownerId: string): Promise<boolean> {
    let wasDeleted: boolean = false;

    const characterToDelete = (await this.characterRepository.readOne(Character, {
      _id: id,
    })) as ICharacter;

    // compare object ids
    // @ts-ignore
    if (!characterToDelete.owner.equals(ownerId)) {
      throw new BadRequestError("You cannot delete a character which is not yours!");
    }

    await characterToDelete
      .remove()
      .then(async () => {
        wasDeleted = true;

        await clearCacheForKey(`character-${characterToDelete._id}-user`);

        return wasDeleted;
      })
      .catch(() => {
        wasDeleted = false;

        return wasDeleted;
      });

    if (wasDeleted) {
      await this.inMemoryHashTable.delete("available-characters", ownerId);
    }

    return wasDeleted;
  }
}
