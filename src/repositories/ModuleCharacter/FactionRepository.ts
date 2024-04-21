import characterTextures from "@providers/characterTextures/data/charactertextures.json";
import { ICharacterTexture } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(FactionRepository)
export class FactionRepository {
  constructor() {}

  public readSprites(characterClass: string, race: string): ICharacterTexture[] {
    return characterTextures.filter(
      (entry) => (entry.class.includes(characterClass) && entry.race.includes(race)) || entry.isGloballyAvailable
    ) as ICharacterTexture[];
  }

  public exists(race: string, textureKey: string): boolean {
    const textures = characterTextures.some((entry) => entry.race.includes(race) && entry.textureKey === textureKey);

    return !!textures;
  }
}
