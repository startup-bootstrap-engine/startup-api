import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { Types } from "mongoose";
import { GuildTerritoryControlPoint } from "../GuildTerritoryControlPoint";

describe("GuildTerritoryControlPoint.ts", () => {
  let guildTerritoryControlPoint: GuildTerritoryControlPoint;
  let testCharacter: ICharacter;
  let testGuild: IGuild;

  beforeAll(() => {
    guildTerritoryControlPoint = container.get<GuildTerritoryControlPoint>(GuildTerritoryControlPoint);
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    testCharacter = await unitTestHelper.createMockCharacter();
    testGuild = await unitTestHelper.createMockGuild();
  });

  it("should update existing control point for a map", async () => {
    const map = "TestMap";
    const exp = 100;
    const existingPoint = 50;

    testGuild.controlPoints = [{ map, point: existingPoint }];

    const mockLeanFn = jest.fn().mockResolvedValue(testGuild);
    jest.spyOn(Guild, "findOne").mockReturnValue({ lean: mockLeanFn } as any);
    const updateOneSpy = jest.spyOn(Guild, "updateOne").mockResolvedValueOnce({} as any);

    await guildTerritoryControlPoint.updateGuildTerritoryControlPoint(map, testCharacter, exp);

    expect(updateOneSpy).toHaveBeenCalledWith(
      { _id: testGuild._id },
      {
        $set: {
          controlPoints: expect.arrayContaining([
            expect.objectContaining({
              _id: expect.any(Types.ObjectId),
              map,
              point: existingPoint + exp / 10,
            }),
          ]),
        },
      }
    );
  });

  it("should add new control point for a new map", async () => {
    const map = "NewMap";
    const exp = 100;

    const mockLeanFn = jest.fn().mockResolvedValue(testGuild);
    jest.spyOn(Guild, "findOne").mockReturnValue({ lean: mockLeanFn } as any);
    const updateOneSpy = jest.spyOn(Guild, "updateOne").mockResolvedValueOnce({} as any);

    await guildTerritoryControlPoint.updateGuildTerritoryControlPoint(map, testCharacter, exp);

    expect(updateOneSpy).toHaveBeenCalledWith(
      { _id: testGuild._id },
      {
        $set: {
          controlPoints: expect.arrayContaining([
            expect.objectContaining({
              _id: expect.any(Types.ObjectId),
              map,
              point: exp / 10,
            }),
          ]),
        },
      }
    );
  });

  it("should not update anything if character is not in a guild", async () => {
    const map = "TestMap";
    const exp = 100;

    const mockLeanFn = jest.fn().mockResolvedValue(null);
    jest.spyOn(Guild, "findOne").mockReturnValue({ lean: mockLeanFn } as any);
    const updateOneSpy = jest.spyOn(Guild, "updateOne");

    await guildTerritoryControlPoint.updateGuildTerritoryControlPoint(map, testCharacter, exp);

    expect(updateOneSpy).not.toHaveBeenCalled();
  });

  it("should steal control points from another guild", async () => {
    const map = "TestMap";
    const exp = 100;
    const existingPoint = 50;
    testGuild.controlPoints = [{ map, point: existingPoint }];
    const mockLeanFn = jest.fn().mockResolvedValue(testGuild);
    jest.spyOn(Guild, "findOne").mockReturnValue({ lean: mockLeanFn } as any);
    const updateOneSpy = jest.spyOn(Guild, "updateOne").mockResolvedValue({} as any);

    const otherGuildId = new Types.ObjectId();
    const otherGuild: IGuild = {
      _id: otherGuildId,
      controlPoints: [{ map, point: 60 }],
    } as IGuild;

    // @ts-ignore
    jest.spyOn(guildTerritoryControlPoint.guildTerritory, "getGuildByTerritoryMap").mockResolvedValue(otherGuild);

    await guildTerritoryControlPoint.updateGuildTerritoryControlPoint(map, testCharacter, exp);

    // Check if points were stolen from enemy guild
    expect(updateOneSpy).toHaveBeenCalledWith(expect.objectContaining({ _id: otherGuildId }), {
      $set: {
        controlPoints: expect.arrayContaining([
          expect.objectContaining({
            map,
            point: 59, // 60 - 1
          }),
        ]),
      },
    });

    // Check if points were added to the player's guild
    expect(updateOneSpy).toHaveBeenCalledWith(expect.objectContaining({ _id: expect.any(Types.ObjectId) }), {
      $set: {
        controlPoints: expect.arrayContaining([
          expect.objectContaining({
            map,
            point: existingPoint + exp / 10 + 1, // Added 1 stolen point
          }),
        ]),
      },
    });
  });

  it("should not steal points if the controlling guild is the same as the player's guild", async () => {
    const map = "TestMap";
    const exp = 100;
    const existingPoint = 50;
    testGuild.controlPoints = [{ map, point: existingPoint }];
    const mockLeanFn = jest.fn().mockResolvedValue(testGuild);
    jest.spyOn(Guild, "findOne").mockReturnValue({ lean: mockLeanFn } as any);
    const updateOneSpy = jest.spyOn(Guild, "updateOne").mockResolvedValue({} as any);

    // @ts-ignore
    jest.spyOn(guildTerritoryControlPoint.guildTerritory, "getGuildByTerritoryMap").mockResolvedValue(testGuild);

    await guildTerritoryControlPoint.updateGuildTerritoryControlPoint(map, testCharacter, exp);

    expect(updateOneSpy).toHaveBeenCalledWith(
      { _id: testGuild._id },
      {
        $set: {
          controlPoints: expect.arrayContaining([
            expect.objectContaining({
              map,
              point: existingPoint + exp / 10, // No stolen points added
            }),
          ]),
        },
      }
    );
  });
});
