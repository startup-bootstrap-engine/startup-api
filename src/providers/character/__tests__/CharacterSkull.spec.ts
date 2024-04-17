import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CHARACTER_SKULL_YELLOW_SKULL_DURATION } from "@providers/constants/CharacterSkullConstants";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterFactions, CharacterSkullType } from "@rpg-engine/shared";
import dayjs from "dayjs";
import { CharacterSkull } from "../CharacterSkull";

describe("CharacterSkull.ts", () => {
  let characterSkull: CharacterSkull;
  let testCharacter: ICharacter;
  let testTargetCharacter: ICharacter;
  let testCharacterWithWhiteSkull: ICharacter;
  let testCharacterWithRedSkull: ICharacter;
  let testCharacterWithYellowSkull: ICharacter;
  let isSamePartySpy: jest.SpyInstance;

  beforeAll(() => {
    characterSkull = container.get<CharacterSkull>(CharacterSkull);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasInventory: true,
      hasSkills: true,
    });
    testTargetCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasInventory: true,
      hasSkills: true,
    });
    testCharacterWithWhiteSkull = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasInventory: true,
      hasSkills: true,
      hasSkull: CharacterSkullType.WhiteSkull,
    });
    testCharacterWithRedSkull = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasInventory: true,
      hasSkills: true,
      hasSkull: CharacterSkullType.RedSkull,
    });
    testCharacterWithYellowSkull = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasInventory: true,
      hasSkills: true,
      hasSkull: CharacterSkullType.YellowSkull,
    });
  });

  it("should know if target is unjustify attack", async () => {
    testCharacter.faction = CharacterFactions.LifeBringer;
    testCharacter.hasSkull = false;
    testTargetCharacter.faction = CharacterFactions.LifeBringer;
    testTargetCharacter.hasSkull = false;
    const isTargetUnjustifiedAttack = await characterSkull.checkForUnjustifiedAttack(
      testCharacter,
      testTargetCharacter
    );

    expect(isTargetUnjustifiedAttack).toBeTruthy();
  });

  it("should know if target is not unjustify attack when faction is not the same", async () => {
    testCharacter.faction = CharacterFactions.LifeBringer;
    testCharacter.hasSkull = false;
    testTargetCharacter.faction = CharacterFactions.ShadowWalker;
    testTargetCharacter.hasSkull = false;
    const isTargetUnjustifiedAttack = await characterSkull.checkForUnjustifiedAttack(
      testCharacter,
      testTargetCharacter
    );

    expect(isTargetUnjustifiedAttack).toBeFalsy;
  });

  it("should know if target is not unjustify attack when target has skull", async () => {
    // @ts-ignore
    isSamePartySpy = jest.spyOn(characterSkull.partyManagement, "checkIfCharacterAndTargetOnTheSameParty");

    testCharacter.faction = CharacterFactions.LifeBringer;
    testCharacter.hasSkull = false;
    testTargetCharacter.faction = CharacterFactions.LifeBringer;
    testTargetCharacter.hasSkull = true;
    const isTargetUnjustifiedAttack = await characterSkull.checkForUnjustifiedAttack(
      testCharacter,
      testTargetCharacter
    );

    expect(isTargetUnjustifiedAttack).toBeFalsy;
    expect(isSamePartySpy).toHaveBeenCalled();
  });

  it("should update to yellow skull when white skull kills a character", async () => {
    const character = testCharacterWithWhiteSkull;
    // add kills
    await unitTestHelper.addUnjustifiedKills(character, 2);

    // update character to red skull
    await expect(characterSkull.updateSkullAfterKill(character._id)).resolves.toBeUndefined();
  });

  it("should update to yellow skull when red skull kills more than three characters", async () => {
    const character = testCharacterWithYellowSkull;
    // add kills
    await unitTestHelper.addUnjustifiedKills(character, 4);

    // update character to red skull
    await expect(characterSkull.updateSkullAfterKill(character._id)).resolves.toBeUndefined();
  });

  it("should renew red skull when a character is red skull and kills a character", async () => {
    const character = testCharacterWithRedSkull;
    character.skullExpiredAt = dayjs().add(CHARACTER_SKULL_YELLOW_SKULL_DURATION, "millisecond").toDate();
    await character.save();

    // reset timer after kill with red skull
    await expect(characterSkull.updateSkullAfterKill(character._id)).resolves.toBeUndefined();
  });

  it("should reset yellow skull when 7 days have passed", async () => {
    const character = testCharacterWithYellowSkull;
    character.skullExpiredAt = dayjs().subtract(1, "second").toDate();
    await character.save();

    // update character to red skull
    await expect(characterSkull.updateSkullAfterKill(character._id)).resolves.toBeUndefined();
  });

  it("should reset red skull when 14 days have passed", async () => {
    const character = testCharacterWithRedSkull;
    character.skullExpiredAt = dayjs().subtract(1000, "millisecond").toDate();
    await character.save();

    // update character to red skull
    await expect(characterSkull.updateSkullAfterKill(character._id)).resolves.toBeUndefined();
  });
});
