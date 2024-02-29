import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterPremiumAccount } from "@providers/character/CharacterPremiumAccount";
import { CharacterBaseSpeed } from "@providers/character/characterMovement/CharacterBaseSpeed";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { Stealth } from "@providers/spells/data/logic/rogue/Stealth";
import { CharacterRepository } from "@repositories/ModuleCharacter/CharacterRepository";
import { UserAccountTypes } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(ReadCharacterUseCase)
export class ReadCharacterUseCase {
  constructor(
    private characterRepository: CharacterRepository,
    private characterInventory: CharacterInventory,
    private stealth: Stealth,
    private characterBaseSpeed: CharacterBaseSpeed,
    private characterPremiumAccount: CharacterPremiumAccount,
    private inMemoryHashTable: InMemoryHashTable
  ) {}

  public async read(id: string, selectFields: string[]): Promise<ICharacter> {
    try {
      const character = await this.fetchCharacter(id, selectFields);
      if (!character) throw new Error("Character not found!");

      return await this.enrichCharacter(character);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async fetchCharacter(id: string, selectFields: string[]): Promise<ICharacter | null> {
    const modelQuery = Character.findOne({ _id: id });
    return selectFields.length > 0
      ? ((await modelQuery.select(selectFields.join(" ")).lean()) as ICharacter)
      : ((await modelQuery
          .populate("owner")
          .populate("skills")
          .lean({ virtuals: true, defaults: true })) as ICharacter);
  }

  private async enrichCharacter(character: ICharacter): Promise<ICharacter> {
    const baseSpeed = (await this.characterBaseSpeed.getBaseSpeed(character)) ?? MovementSpeed.Standard;

    const [alpha, inventory, accountType] = await Promise.all([
      this.stealth.getOpacity(character),
      this.characterInventory.getInventory(character),
      this.characterPremiumAccount.getPremiumAccountType(character),
    ]);

    return {
      ...character,
      alpha,
      inventory,
      baseSpeed,
      owner: {
        accountType: accountType ?? UserAccountTypes.Free,
      },
      speed: baseSpeed,
    } as unknown as ICharacter;
  }

  public async readAll(ownerId: string): Promise<ICharacter[]> {
    let characters = await this.characterRepository.readAll(Character, { owner: ownerId }, false, null, true);
    characters = characters.filter((char) => !char.isSoftDeleted);

    const charactersCache = (await this.inMemoryHashTable.get("available-characters", ownerId)) as ICharacter[];

    if (charactersCache) {
      return charactersCache;
    }

    const result = await Promise.all(characters.map((char) => this.enrichCharacter(char)));

    await this.inMemoryHashTable.set("available-characters", ownerId, result);

    return result;
  }
}
