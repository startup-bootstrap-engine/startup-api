import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { BattleAttackTarget } from "@providers/battle/BattleAttackTarget/BattleAttackTarget";
import { CharacterView } from "@providers/character/CharacterView";
import { battleAttackTarget, container, unitTestHelper } from "@providers/inversify/container";
import { Locker } from "@providers/locks/Locker";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { EntityType, FromGridX, MapSocketEvents, ViewSocketEvents } from "@rpg-engine/shared";
import { MapTransitionDifferentMap } from "../MapTransitionDifferentMap";

describe("MapTransitionDifferentMap", () => {
  let mapTransitionDifferentMap: MapTransitionDifferentMap;
  let testCharacter: ICharacter;

  let clearCharacterBattleTargetSpy: jest.SpyInstance;

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, {});

    mapTransitionDifferentMap = container.get<MapTransitionDifferentMap>(MapTransitionDifferentMap);

    await unitTestHelper.initializeMapLoader();

    clearCharacterBattleTargetSpy = jest.spyOn(BattleAttackTarget.prototype, "clearCharacterBattleTarget");

    jest.spyOn(battleAttackTarget, "clearCharacterBattleTarget").mockResolvedValue();

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should change the character's scene to the destination map", async () => {
    testCharacter.owner = testCharacter.id;
    testCharacter.name = "Test";
    await testCharacter.save();
    const destination = { map: "map2", gridX: 0, gridY: 0 };
    await mapTransitionDifferentMap.changeCharacterScene(testCharacter, destination);
    const updatedCharacter = await Character.findOne({ _id: testCharacter.id });
    // @ts-ignore
    expect(updatedCharacter.scene).toEqual(destination.map);
  });

  it("should update the character's position to the destination grid position", async () => {
    testCharacter.scene = "map1";
    testCharacter.x = 0;
    testCharacter.y = 0;
    testCharacter.owner = testCharacter.id;
    testCharacter.name = "Test";
    await testCharacter.save();
    const destination = { map: "map1", gridX: 5, gridY: 5 };
    await mapTransitionDifferentMap.changeCharacterScene(testCharacter, destination);
    const updatedCharacter = await Character.findOne({ _id: testCharacter.id });
    // @ts-ignore
    expect(updatedCharacter.x).toEqual(FromGridX(destination.gridX));
    // @ts-ignore
    expect(updatedCharacter.y).toEqual(FromGridX(destination.gridY));
  });

  it("changeCharacterScene updates character scene and coordinates correctly", async () => {
    testCharacter.scene = "oldScene";
    testCharacter.x = 10;
    testCharacter.y = 20;

    const destination = { map: "newScene", gridX: 15, gridY: 25 };
    const updateOneMock = jest.fn().mockResolvedValue(null);
    Character.updateOne = updateOneMock;
    // @ts-ignore
    await mapTransitionDifferentMap.changeCharacterScene(testCharacter, destination);

    expect(updateOneMock).toHaveBeenCalledWith(
      { _id: testCharacter._id },
      {
        $set: {
          scene: "newScene",
          x: FromGridX(15),
          y: FromGridX(25),
        },
      }
    );
  });

  it("should cancel the character's target if it is set", async () => {
    // @ts-ignore
    testCharacter.target = { id: testCharacter.id, type: EntityType.Character };
    testCharacter.owner = testCharacter.id;
    testCharacter.name = "test";

    const destination = { map: "map1", gridX: 5, gridY: 5 };

    await mapTransitionDifferentMap.changeCharacterScene(testCharacter, destination);

    expect(clearCharacterBattleTargetSpy).toHaveBeenCalledWith(testCharacter);

    const updatedCharacter = await Character.findOne({ _id: testCharacter.id });
    // @ts-ignore
    expect(updatedCharacter.target.id).toBe(undefined);
  });

  it("should send the ChangeMap event to the character's channel", async () => {
    const destination = { map: "map1", gridX: 5, gridY: 5 };
    // @ts-ignore
    const sendEventToUserSpy = jest.spyOn(mapTransitionDifferentMap.socketMessaging, "sendEventToUser");
    await mapTransitionDifferentMap.changeCharacterScene(testCharacter, destination);
    expect(sendEventToUserSpy).toHaveBeenCalledWith(testCharacter.channelId, MapSocketEvents.ChangeMap, {
      map: "map1",
      x: 80,
      y: 80,
    });
  });

  it("should send the Destroy event to characters around the character with the character's id", async () => {
    const destination = { map: "map1", gridX: 5, gridY: 5 };
    // @ts-ignore
    const sendSpy = jest.spyOn(mapTransitionDifferentMap.socketMessaging, "sendEventToCharactersAroundCharacter");
    await mapTransitionDifferentMap.changeCharacterScene(testCharacter, destination);
    expect(sendSpy).toHaveBeenCalled;
  });

  describe("Edge cases", () => {
    let clearCharacterBattleTargetSpy: jest.SpyInstance;
    let lockerSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;
    let characterUpdateOneMock: jest.SpyInstance;

    beforeEach(() => {
      clearCharacterBattleTargetSpy = jest
        .spyOn(BattleAttackTarget.prototype, "clearCharacterBattleTarget")
        .mockResolvedValue();
      lockerSpy = jest.spyOn(Locker.prototype, "lock").mockResolvedValue(true);
      consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      // @ts-ignore
      characterUpdateOneMock = jest.spyOn(Character, "updateOne").mockResolvedValue(null);

      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should handle errors gracefully", async () => {
      const destination = { map: "map2", gridX: 0, gridY: 0 };
      jest.spyOn(Character, "updateOne").mockRejectedValue(new Error("Update failed"));

      await expect(mapTransitionDifferentMap.changeCharacterScene(testCharacter, destination)).resolves.not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it("should not proceed if locker is not acquired", async () => {
      lockerSpy.mockResolvedValue(false);
      const destination = { map: "map2", gridX: 0, gridY: 0 };

      await mapTransitionDifferentMap.changeCharacterScene(testCharacter, destination);

      expect(Character.updateOne).not.toHaveBeenCalled();
    });

    it("should clear character's view after changing scene", async () => {
      const clearCharacterViewSpy = jest
        // @ts-ignore
        .spyOn(CharacterView.prototype, "clearCharacterView")
        .mockResolvedValue();

      const destination = { map: "map2", gridX: 0, gridY: 0 };
      await mapTransitionDifferentMap.changeCharacterScene(testCharacter, destination);

      expect(clearCharacterViewSpy).toHaveBeenCalledWith(testCharacter);
    });

    it("should send Destroy event to characters around after changing scene", async () => {
      const sendEventToCharactersAroundCharacterSpy = jest.spyOn(
        // @ts-ignore
        SocketMessaging.prototype,
        "sendEventToCharactersAroundCharacter"
      );

      const destination = { map: "map2", gridX: 0, gridY: 0 };
      await mapTransitionDifferentMap.changeCharacterScene(testCharacter, destination);

      expect(sendEventToCharactersAroundCharacterSpy).toHaveBeenCalledWith(testCharacter, ViewSocketEvents.Destroy, {
        type: "characters",
        id: testCharacter._id,
      });
    });

    it("should not update character scene if an error occurs", async () => {
      const destination = { map: "map2", gridX: 0, gridY: 0 };
      jest.spyOn(Character, "updateOne").mockImplementation(() => {
        throw new Error("Update failed");
      });

      await mapTransitionDifferentMap.changeCharacterScene(testCharacter, destination);

      const updatedCharacter = await Character.findOne({ _id: testCharacter.id });
      expect(updatedCharacter?.scene).not.toEqual(destination.map);
    });
  });
});
