import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import {
  GUILD_CONTROL_MINIMUM_THRESHOLD,
  GUILD_CONTROL_POINT_DECREASE_PERCENTAGE,
  GUILD_TERRITORY_INACTIVITY_THRESHOLD_DAYS,
} from "@providers/constants/GuildConstants";
import { container, unitTestHelper } from "@providers/inversify/container";
import dayjs from "dayjs";
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

    testGuild.controlPoints = [{ map, point: existingPoint, lastUpdated: new Date() }];

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

  describe("reduceControlPointForNonActiveGuild", () => {
    it("should reduce control points for inactive guilds and update territories", async () => {
      const mockGuilds = [
        {
          _id: new Types.ObjectId(),
          name: "Active Guild",
          controlPoints: [
            { map: "Map1", point: 100, lastUpdated: new Date() },
            {
              map: "Map2",
              point: 50,
              lastUpdated: dayjs()
                .subtract(GUILD_TERRITORY_INACTIVITY_THRESHOLD_DAYS + 1, "day")
                .toDate(),
            },
          ],
          territoriesOwned: [
            { map: "Map1", lootShare: 10, controlPoint: true },
            { map: "Map2", lootShare: 5, controlPoint: true },
          ],
        },
        {
          _id: new Types.ObjectId(),
          name: "Inactive Guild",
          controlPoints: [
            {
              map: "Map3",
              point: 30,
              lastUpdated: dayjs()
                .subtract(GUILD_TERRITORY_INACTIVITY_THRESHOLD_DAYS + 1, "day")
                .toDate(),
            },
          ],
          territoriesOwned: [{ map: "Map3", lootShare: 3, controlPoint: true }],
        },
      ];

      const findSpy = jest
        .spyOn(Guild, "find")
        .mockReturnValue({ lean: jest.fn().mockResolvedValue(mockGuilds) } as any);
      const findByIdAndUpdateSpy = jest.spyOn(Guild, "findByIdAndUpdate").mockImplementation((id, update) => {
        const guild = mockGuilds.find((g) => g._id.toString() === id.toString());
        if (guild && update && "$set" in update) {
          Object.assign(guild, update.$set);
        }
        return { exec: jest.fn().mockResolvedValue(guild) } as any;
      });
      const bulkWriteSpy = jest.spyOn(Guild, "bulkWrite").mockResolvedValue({} as never);
      const trySetMapControlSpy = jest
        // @ts-ignore
        .spyOn(guildTerritoryControlPoint.guildTerritory, "trySetMapControl")
        .mockResolvedValue(undefined);

      await guildTerritoryControlPoint.reduceControlPointForNonActiveGuild();

      expect(findSpy).toHaveBeenCalled();
      expect(findByIdAndUpdateSpy).toHaveBeenCalledTimes(2);
      expect(bulkWriteSpy).toHaveBeenCalledTimes(1);

      const expectedReducedPoint = Math.max(
        GUILD_CONTROL_MINIMUM_THRESHOLD,
        50 * (1 - GUILD_CONTROL_POINT_DECREASE_PERCENTAGE / 100)
      );
      const expectedInactivePoint = Math.max(0, 30 * (1 - GUILD_CONTROL_POINT_DECREASE_PERCENTAGE / 100));

      expect(bulkWriteSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            updateOne: {
              filter: { _id: mockGuilds[0]._id },
              update: {
                $set: {
                  controlPoints: [
                    { map: "Map1", point: 100, lastUpdated: expect.any(Date) },
                    { map: "Map2", point: expectedReducedPoint, lastUpdated: expect.any(Date) },
                  ],
                  territoriesOwned: [
                    { map: "Map1", lootShare: 10, controlPoint: true },
                    { map: "Map2", lootShare: 5, controlPoint: true },
                  ],
                },
              },
            },
          }),
          expect.objectContaining({
            updateOne: {
              filter: { _id: mockGuilds[1]._id },
              update: {
                $set: {
                  controlPoints: [{ map: "Map3", point: expectedInactivePoint, lastUpdated: expect.any(Date) }],
                  territoriesOwned:
                    expectedInactivePoint > GUILD_CONTROL_MINIMUM_THRESHOLD
                      ? [{ map: "Map3", lootShare: 3, controlPoint: true }]
                      : [],
                },
              },
            },
          }),
        ])
      );

      expect(trySetMapControlSpy).toHaveBeenCalledWith("Map2");
      expect(trySetMapControlSpy).toHaveBeenCalledWith("Map3");
    });
  });
  it("should steal control points from another guild", async () => {
    const map = "TestMap";
    const exp = 100;
    const existingPoint = 50;
    testGuild.controlPoints = [{ map, point: existingPoint, lastUpdated: new Date() }];
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
    testGuild.controlPoints = [{ map, point: existingPoint, lastUpdated: new Date() }];
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
