import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { BattleSocketEvents, FromGridX, MapSocketEvents } from "@rpg-engine/shared";
import { EntityType } from "@rpg-engine/shared/dist/types/entity.types";
import { MapTransition } from "../MapTransition";

describe("MapTransitionTeleport", () => {
  let mapTransitionTeleport: MapTransition;
  let testCharacter: ICharacter;
  let destination;

  beforeEach(async () => {
    destination = {
      map: "map1",
      gridX: 2,
      gridY: 4,
    };

    testCharacter = await unitTestHelper.createMockCharacter(null, {});

    mapTransitionTeleport = container.get<MapTransition>(MapTransition);

    await unitTestHelper.initializeMapLoader();
  });
  afterEach(() => {
    jest.clearAllMocks();

    destination = null;
  });

  it("teleportCharacter updates character position correctly", async () => {
    testCharacter.scene = "map1";
    destination = {
      map: "map1",
      gridX: 2,
      gridY: 4,
    };
    // @ts-ignore
    await mapTransitionTeleport.sameMapTeleport(testCharacter, destination);
    const updatedCharacter = await Character.findOne({ _id: testCharacter._id });
    // @ts-ignore
    expect(updatedCharacter.x).toEqual(FromGridX(destination.gridX));
    // @ts-ignore
    expect(updatedCharacter.y).toEqual(FromGridX(destination.gridY));
  });

  it("should change the character's scene to the destination map", async () => {
    testCharacter.owner = testCharacter.id;
    testCharacter.name = "Test";
    await testCharacter.save();
    const destination = { map: "map2", gridX: 0, gridY: 0 };
    await mapTransitionTeleport.changeCharacterScene(testCharacter, destination);
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
    await mapTransitionTeleport.changeCharacterScene(testCharacter, destination);
    const updatedCharacter = await Character.findOne({ _id: testCharacter.id });
    // @ts-ignore
    expect(updatedCharacter.x).toEqual(FromGridX(destination.gridX));
    // @ts-ignore
    expect(updatedCharacter.y).toEqual(FromGridX(destination.gridY));
  });

  test("changeCharacterScene updates character scene and coordinates correctly", async () => {
    testCharacter.scene = "oldScene";
    testCharacter.x = 10;
    testCharacter.y = 20;

    const destination = { map: "newScene", gridX: 15, gridY: 25 };
    const updateOneMock = jest.fn().mockResolvedValue(null);
    Character.updateOne = updateOneMock;
    // @ts-ignore
    await mapTransitionTeleport.changeCharacterScene(testCharacter, destination);

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

  // test("changeCharacterScene cancels character targeting if they have a target set", async () => {
  //   testCharacter.scene = "oldScene";
  //   testCharacter.x = 10;
  //   testCharacter.y = 20;
  //   // @ts-ignore
  //   testCharacter.target = { id: testCharacter.id, type: EntityType.Character };
  //   await testCharacter.save();

  //   const destination = { map: "newScene", gridX: 15, gridY: 25 };
  //   const updateOneMock = jest.fn().mockResolvedValue(null);
  //   Character.updateOne = updateOneMock;
  //   const sendEventToUserMock = jest.fn().mockResolvedValue(null);
  //   const stopTargetingMock = jest.fn().mockResolvedValue(null);
  //   const mapTransition = new MapTransition(
  //     // @ts-ignore
  //     {}, // mock MapObjectsLoader
  //     { sendEventToUser: sendEventToUserMock }, // mock SocketMessaging
  //     { stopTargeting: stopTargetingMock } // mock BattleNetworkStopTargeting
  //   );
  //   // @ts-ignore
  //   await mapTransition.changeCharacterScene(testCharacter, destination);
  //   // @ts-ignore
  //   expect(stopTargetingMock).toHaveBeenCalledWith(testCharacter);
  //   expect(sendEventToUserMock).toHaveBeenCalledWith(testCharacter.channelId, BattleSocketEvents.CancelTargeting, {
  //     targetId: testCharacter.target.id,
  //     type: testCharacter.target.type,
  //     reason: "Your battle target was lost.",
  //   });
  // });

  it("changeCharacterScene cancels character targeting if they have a target set", async () => {
    // Set up test character and destination
    // @ts-ignore
    testCharacter.target = { id: testCharacter.id, type: EntityType.Character };
    await testCharacter.save();
    const destination = { map: "newScene", gridX: 15, gridY: 25 };

    // Mock functions
    const sendEventToUserMock = jest.fn().mockResolvedValue(null);
    // @ts-ignore
    mapTransitionTeleport.socketMessaging.sendEventToUser = sendEventToUserMock;
    const stopTargetingMock = jest.fn().mockResolvedValue(null);
    // @ts-ignore
    mapTransitionTeleport.battleNetworkStopTargeting.stopTargeting = stopTargetingMock;

    // Call changeCharacterScene
    await mapTransitionTeleport.changeCharacterScene(testCharacter, destination);

    // Assertions
    expect(stopTargetingMock).toHaveBeenCalledWith(testCharacter);
    expect(sendEventToUserMock).toHaveBeenCalledWith(testCharacter.channelId!, BattleSocketEvents.CancelTargeting, {
      targetId: testCharacter._id,
      type: EntityType.Character,
      reason: "Your battle target was lost.",
    });
  });

  it("should cancel the character's target if it is set", async () => {
    // @ts-ignore
    testCharacter.target = { id: testCharacter.id, type: EntityType.Character };
    testCharacter.owner = testCharacter.id;
    testCharacter.name = "test";

    const destination = { map: "map1", gridX: 5, gridY: 5 };

    // @ts-ignore
    const stopTargetingSpy = jest.spyOn(mapTransitionTeleport.battleNetworkStopTargeting, "stopTargeting");
    await mapTransitionTeleport.changeCharacterScene(testCharacter, destination);
    expect(stopTargetingSpy).toHaveBeenCalledWith(testCharacter);

    const updatedCharacter = await Character.findOne({ _id: testCharacter.id });
    // @ts-ignore
    expect(updatedCharacter.target.id).toBe(undefined);
  });

  it("should send the ChangeMap event to the character's channel", async () => {
    const destination = { map: "map1", gridX: 5, gridY: 5 };
    // @ts-ignore
    const sendEventToUserSpy = jest.spyOn(mapTransitionTeleport.socketMessaging, "sendEventToUser");
    await mapTransitionTeleport.changeCharacterScene(testCharacter, destination);
    expect(sendEventToUserSpy).toHaveBeenCalledWith(testCharacter.channelId, MapSocketEvents.ChangeMap, {
      map: "map1",
      x: 80,
      y: 80,
    });
  });

  it("should send the Destroy event to characters around the character with the character's id", async () => {
    const destination = { map: "map1", gridX: 5, gridY: 5 };
    // @ts-ignore
    const sendSpy = jest.spyOn(mapTransitionTeleport.socketMessaging, "sendEventToCharactersAroundCharacter");
    await mapTransitionTeleport.changeCharacterScene(testCharacter, destination);
    expect(sendSpy).toHaveBeenCalled;
  });

  it("teleport character within the same map", async () => {
    testCharacter.scene = "map1";
    const destination = {
      map: "map1",
      gridX: 5,
      gridY: 5,
    };
    const updateOneMock = jest.fn().mockResolvedValue(null);
    Character.updateOne = updateOneMock;

    // Act
    // @ts-ignore
    await mapTransitionTeleport.sameMapTeleport(testCharacter, destination);

    // Assert
    expect(updateOneMock).toHaveBeenCalledWith(
      { _id: testCharacter._id },
      {
        $set: {
          x: FromGridX(5),
          y: FromGridX(5),
          scene: "map1",
        },
      }
    );
  });

  it("should clear the character's target when teleporting", async () => {
    // @ts-ignore
    testCharacter.target = { id: testCharacter.id, type: EntityType.Character };

    await mapTransitionTeleport.sameMapTeleport(testCharacter, {
      map: testCharacter.scene,
      gridX: 1,
      gridY: 1,
    });

    testCharacter = (await Character.findOne({ _id: testCharacter._id })) as ICharacter;

    // Assert that the character's target has been cleared
    expect(testCharacter.target.id).toBeUndefined();
  });
});
