import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterView } from "@providers/character/CharacterView";
import { battleAttackTarget, unitTestHelper } from "@providers/inversify/container";
import { Locker } from "@providers/locks/Locker";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { EntityType, FromGridX, MapSocketEvents, ViewSocketEvents } from "@rpg-engine/shared";
import { MapTransitionSameMap } from "../MapTransitionSameMap";

describe("MapTransitionSameMap", () => {
  let mapTransitionSameMap: MapTransitionSameMap;
  let testCharacter: ICharacter;
  let destination;
  let socketMessagingMock: jest.Mocked<SocketMessaging>;
  let characterViewMock: jest.Mocked<CharacterView>;
  let lockerMock: jest.Mocked<Locker>;

  beforeEach(async () => {
    destination = {
      map: "map1",
      gridX: 2,
      gridY: 4,
    };

    testCharacter = await unitTestHelper.createMockCharacter(null, {});

    socketMessagingMock = {
      sendEventToUser: jest.fn(),
      sendEventToCharactersAroundCharacter: jest.fn(),
    } as any;

    characterViewMock = {
      clearCharacterView: jest.fn(),
    } as any;

    mapTransitionSameMap = new MapTransitionSameMap(socketMessagingMock, characterViewMock);

    await unitTestHelper.initializeMapLoader();

    jest.spyOn(battleAttackTarget, "clearCharacterBattleTarget").mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
    destination = null;
  });

  it("teleports character to the correct position on the same map", async () => {
    testCharacter.scene = "map1";
    await mapTransitionSameMap.sameMapTeleport(testCharacter, destination);

    const updatedCharacter = await Character.findOne({ _id: testCharacter._id }).lean();
    expect(updatedCharacter?.x).toEqual(FromGridX(destination.gridX));
    expect(updatedCharacter?.y).toEqual(FromGridX(destination.gridY));
    expect(updatedCharacter?.scene).toEqual(destination.map);
  });

  it("should clear the character's target when teleporting", async () => {
    // @ts-ignore
    testCharacter.target = { id: testCharacter.id, type: EntityType.Character };

    await mapTransitionSameMap.sameMapTeleport(testCharacter, {
      map: testCharacter.scene,
      gridX: 1,
      gridY: 1,
    });

    testCharacter = (await Character.findOne({ _id: testCharacter._id })) as ICharacter;

    // Assert that the character's target has been cleared
    expect(testCharacter.target.id).toBeUndefined();
  });

  it("clears character battle target", async () => {
    testCharacter.scene = "map1";
    await mapTransitionSameMap.sameMapTeleport(testCharacter, destination);
    expect(battleAttackTarget.clearCharacterBattleTarget).toHaveBeenCalledWith(testCharacter);
  });

  it("clears character view", async () => {
    testCharacter.scene = "map1";
    await mapTransitionSameMap.sameMapTeleport(testCharacter, destination);
    expect(characterViewMock.clearCharacterView).toHaveBeenCalledWith(testCharacter);
  });

  it("sends SameMapTeleport event to the user", async () => {
    testCharacter.scene = "map1";
    testCharacter.channelId = "testChannelId";
    await mapTransitionSameMap.sameMapTeleport(testCharacter, destination);
    expect(socketMessagingMock.sendEventToUser).toHaveBeenCalledWith(
      testCharacter.channelId,
      MapSocketEvents.SameMapTeleport,
      destination
    );
  });

  it("sends Destroy event to characters around the teleported character", async () => {
    testCharacter.scene = "map1";
    await mapTransitionSameMap.sameMapTeleport(testCharacter, destination);
    expect(socketMessagingMock.sendEventToCharactersAroundCharacter).toHaveBeenCalledWith(
      testCharacter,
      ViewSocketEvents.Destroy,
      {
        type: "characters",
        id: testCharacter._id,
      }
    );
  });
});
