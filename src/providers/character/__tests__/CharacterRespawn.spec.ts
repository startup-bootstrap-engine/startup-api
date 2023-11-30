import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterDeath } from "../CharacterDeath";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterFactions } from "@rpg-engine/shared";
import { INITIAL_STARTING_POINTS } from "@providers/constants/CharacterConstants";
import mongoose from "mongoose";

describe("Character Respawn", () => {
  let characterDeath: CharacterDeath;
  let testCharacter: ICharacter;

  beforeAll(() => {
    characterDeath = container.get<CharacterDeath>(CharacterDeath);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter({
      _id: mongoose.Types.ObjectId(),
      x: 400,
      y: 304,
      faction: CharacterFactions.ShadowWalker, // Just a test, but you can change the faction
    });
  });

  it("should respawn the character correctly", async () => {
    await characterDeath.respawnCharacter(testCharacter);

    const updatedCharacter = await Character.findById(testCharacter._id).lean();

    expect(updatedCharacter?.x).toEqual(1600);
    expect(updatedCharacter?.y).toEqual(240);
    expect(updatedCharacter?.scene).toEqual(INITIAL_STARTING_POINTS["Shadow Walker"].scene);
  });
});
