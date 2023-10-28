import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container } from "@providers/inversify/container";
import { CharacterMonitorCallbackTracker } from "../CharacterMonitorCallbackTracker";

describe("CharacterMonitorCallbackTracker", () => {
  let characterMonitorCallbackTracker: CharacterMonitorCallbackTracker;
  let testCharacter: ICharacter;

  beforeAll(() => {
    characterMonitorCallbackTracker = container.get(CharacterMonitorCallbackTracker);
  });

  beforeEach(() => {
    testCharacter = {
      _id: "testCharacterId",
    } as ICharacter;
  });

  afterEach(async () => {
    await characterMonitorCallbackTracker.removeAllCallbacks(testCharacter); // Cleanup
  });

  it("should properly set up a character callback", async () => {
    await characterMonitorCallbackTracker.setCallback(testCharacter, "test-callback-1");

    const hasCallback = await characterMonitorCallbackTracker.getCallback(testCharacter, "test-callback-1");

    expect(hasCallback).toBeTruthy();
  });

  it("should retrieve the existing callback", async () => {
    await characterMonitorCallbackTracker.setCallback(testCharacter, "test-callback-2");

    const callback = await characterMonitorCallbackTracker.getCallback(testCharacter, "test-callback-2");

    expect(callback).toBeTruthy();
  });

  it("should retrieve all existing callback IDs", async () => {
    await characterMonitorCallbackTracker.setCallback(testCharacter, "test-callback-3");
    await characterMonitorCallbackTracker.setCallback(testCharacter, "test-callback-4");

    const callbackIds = await characterMonitorCallbackTracker.getCallbackIds(testCharacter);

    expect(callbackIds).toEqual(expect.arrayContaining(["test-callback-3", "test-callback-4"]));
  });

  it("should remove an existing callback", async () => {
    await characterMonitorCallbackTracker.setCallback(testCharacter, "test-callback-5");

    await characterMonitorCallbackTracker.removeCallback(testCharacter, "test-callback-5");

    const callback = await characterMonitorCallbackTracker.getCallback(testCharacter, "test-callback-5");

    expect(callback).toBeFalsy();
  });

  it("should remove all existing callbacks", async () => {
    await characterMonitorCallbackTracker.setCallback(testCharacter, "test-callback-6");
    await characterMonitorCallbackTracker.setCallback(testCharacter, "test-callback-7");

    await characterMonitorCallbackTracker.removeAllCallbacks(testCharacter);

    const callbackIds = await characterMonitorCallbackTracker.getCallbackIds(testCharacter);

    expect(callbackIds.length).toBe(0);
  });

  it("should handle non-existing characters gracefully", async () => {
    const callback = await characterMonitorCallbackTracker.getCallback(
      { _id: "nonExistingId" } as ICharacter,
      "test-callback-8"
    );

    expect(callback).toBeFalsy();
  });

  it("should handle non-existing callbacks gracefully", async () => {
    const callback = await characterMonitorCallbackTracker.getCallback(testCharacter, "non-existing-callback");

    expect(callback).toBeFalsy();
  });
});
