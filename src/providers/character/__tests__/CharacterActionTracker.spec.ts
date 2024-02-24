import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterActionsTracker } from "../CharacterActionsTracker";

describe("CharacterActionTracker", () => {
  let characterActionsTracker: CharacterActionsTracker;
  let testCharacter: ICharacter;

  beforeAll(() => {
    characterActionsTracker = container.get(CharacterActionsTracker);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter();

    jest.clearAllMocks();
  });

  it("should properly record a character action", async () => {
    await characterActionsTracker.setCharacterAction(testCharacter._id, "test-action");

    const actions = await characterActionsTracker.getCharacterActions(testCharacter._id);
    expect(actions).toEqual(["test-action"]);
  });

  it("should handle setting action when character has no previous actions", async () => {
    await characterActionsTracker.setCharacterAction(testCharacter._id, "new-action");

    const actions = await characterActionsTracker.getCharacterActions(testCharacter._id);
    expect(actions).toEqual(["new-action"]);
  });

  it("should not exceed the maximum storage threshold", async () => {
    await characterActionsTracker.setCharacterAction(testCharacter._id, "action-1");
    await characterActionsTracker.setCharacterAction(testCharacter._id, "action-2");
    await characterActionsTracker.setCharacterAction(testCharacter._id, "action-3");

    const actions = await characterActionsTracker.getCharacterActions(testCharacter._id);

    // first one is shifted out
    expect(actions).toEqual(["action-2", "action-3"]);
  });

  it("should clear specific character actions", async () => {
    await characterActionsTracker.setCharacterAction(testCharacter._id, "action-to-clear");
    await characterActionsTracker.clearCharacterActions(testCharacter._id);

    const actionsAfterClear = await characterActionsTracker.getCharacterActions(testCharacter._id);
    expect(actionsAfterClear).toEqual([]);
  });

  it("should clear all character actions", async () => {
    await characterActionsTracker.setCharacterAction(testCharacter._id, "action-to-clear");
    await characterActionsTracker.clearAllCharacterActions();

    const actionsAfterClearAll = await characterActionsTracker.getCharacterActions(testCharacter._id);
    expect(actionsAfterClearAll).toEqual([]);
  });
});
