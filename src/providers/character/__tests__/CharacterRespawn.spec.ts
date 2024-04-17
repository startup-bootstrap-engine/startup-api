import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INITIAL_STARTING_POINTS } from "@providers/constants/CharacterConstants";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterFactions, FromGridX, FromGridY } from "@rpg-engine/shared";
import mongoose from "mongoose";
import { CharacterRespawn } from "../CharacterRespawn";

describe("Character Respawn", () => {
  let testCharacter: ICharacter;
  let characterRespawn: CharacterRespawn;

  beforeAll(() => {
    characterRespawn = container.get<CharacterRespawn>(CharacterRespawn);
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
    await characterRespawn.respawnCharacter(testCharacter);

    const updatedCharacter = await Character.findById(testCharacter._id).lean();

    expect(updatedCharacter?.x).toEqual(FromGridX(93));
    expect(updatedCharacter?.y).toEqual(FromGridY(106));
    expect(updatedCharacter?.scene).toEqual("ilya");
  });

  it("should respawn the character in farming scene if farming mode is true", async () => {
    testCharacter.isFarmingMode = true;
    await characterRespawn.respawnCharacter(testCharacter);

    const updatedCharacter = await Character.findById(testCharacter._id).lean();

    expect(updatedCharacter?.scene).toEqual(INITIAL_STARTING_POINTS["Farming Mode"]?.scene);
  });
});
