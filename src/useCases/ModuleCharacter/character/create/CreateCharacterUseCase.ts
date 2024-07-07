import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { User } from "@entities/ModuleSystem/UserModel";
import { ACCOUNT_MAX_CHAR_LIMIT } from "@providers/constants/AccountConstants";
import { isAlphanumeric } from "@providers/constants/AlphanumericConstants";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { TS } from "@providers/translation/TranslationHelper";
import { CharacterRepository } from "@repositories/ModuleCharacter/CharacterRepository";
import { FactionRepository } from "@repositories/ModuleCharacter/FactionRepository";
import { provide } from "inversify-binding-decorators";
import { CreateCharacterDTO } from "./CreateCharacterDTO";

@provide(CreateCharacterUseCase)
export class CreateCharacterUseCase {
  constructor(private characterRepository: CharacterRepository, private factionRepository: FactionRepository) {}

  public async create(newCharacter: CreateCharacterDTO, ownerId: string): Promise<ICharacter> {
    // assign character to user
    // eslint-disable-next-line mongoose-lean/require-lean
    const user = await User.findOne({ _id: ownerId });
    if (!user) {
      throw new BadRequestError("Character creation error: User not found!");
    }

    if (user.characters && user.characters.length >= ACCOUNT_MAX_CHAR_LIMIT) {
      throw new BadRequestError("Maximum character limit reached");
    }

    const trimmedTextureKey = newCharacter.textureKey.trim();
    const isValidTextureKey = await this.factionRepository.exists(newCharacter.race, trimmedTextureKey);
    if (!isValidTextureKey) {
      throw new BadRequestError(
        TS.translate("validation", "requiredResourceCreate", {
          field: "textureKey",
        })
      );
    }

    const trimmedName = newCharacter.name.trim();
    if (!isAlphanumeric(trimmedName)) {
      throw new BadRequestError("Sorry, your character name must use only letters or numbers (alphanumeric)!");
    }

    const createdCharacter = await this.characterRepository.createCharacter(
      { ...newCharacter, name: trimmedName, textureKey: trimmedTextureKey },
      ownerId
    );

    user.characters?.push(createdCharacter._id);
    // eslint-disable-next-line mongoose-lean/require-lean
    await user.save();

    return createdCharacter;
  }
}
