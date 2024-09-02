import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { GuildTerritory } from "../GuildTerritory";

describe("GuildTerritory.ts", () => {
  let guildTerritory: GuildTerritory;
  let testGuild: IGuild;

  beforeAll(() => {
    guildTerritory = container.get<GuildTerritory>(GuildTerritory);
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    testGuild = await unitTestHelper.createMockGuild();
  });

  describe("SortGuildsByMapPoints", () => {
    it("should sort guilds by their points for a given map", () => {
      const map = "TestMap";
      const guilds = [
        {
          _id: "1",
          controlPoints: [
            { map: "OtherMap", point: 300 },
            { map, point: 100 },
          ],
        },
        {
          _id: "2",
          controlPoints: [
            { map: "OtherMap", point: 50 },
            { map, point: 200 },
          ],
        },
        { _id: "3", controlPoints: [{ map: "OtherMap", point: 300 }] },
      ] as IGuild[];

      // @ts-ignore
      const result = guildTerritory.sortGuildsByMapPoints(guilds, map);

      expect(result).toEqual([
        { guildId: "2", points: 200 },
        { guildId: "1", points: 100 },
        { guildId: "3", points: 0 },
      ]);
    });
  });

  describe("removeTerritoriesForMap", () => {
    it("should remove territories for the given map from all guilds", async () => {
      jest.clearAllMocks();
      const map = "TestMap";
      const updateManySpy = jest.spyOn(Guild, "updateMany").mockResolvedValue({ n: 2, nModified: 2 } as any);

      // @ts-ignore
      await guildTerritory.removeTerritoriesForMap(map);

      expect(updateManySpy).toHaveBeenCalledWith(
        { "territoriesOwned.map": map },
        { $pull: { territoriesOwned: { map: map } } }
      );
    });
  });

  describe("getMapControl", () => {
    let testGuild2: IGuild;
    beforeEach(async () => {
      testGuild2 = await unitTestHelper.createMockGuild();
    });
    it("should return the guild with the highest control points for the given map", async () => {
      const map = "TestMap";
      testGuild.controlPoints = [
        { map: "map1", point: 300, lastUpdated: new Date() },
        { map, point: 100, lastUpdated: new Date() },
      ];
      await testGuild.save();
      testGuild2.controlPoints = [
        { map: "map2", point: 50, lastUpdated: new Date() },
        { map, point: 200, lastUpdated: new Date() },
      ];
      await testGuild2.save();
      const result = await guildTerritory.getMapControl(map);
      expect(result?._id.toString()).toEqual(testGuild2.id);
    });

    it("should return null if no guilds are found", async () => {
      const map = "TestMap";
      testGuild.controlPoints = [
        { map: "map1", point: 300, lastUpdated: new Date() },
        { map: "map2", point: 100, lastUpdated: new Date() },
      ];
      await testGuild.save();
      testGuild2.controlPoints = [
        { map: "map2", point: 50, lastUpdated: new Date() },
        { map: "map3", point: 200, lastUpdated: new Date() },
      ];
      await testGuild2.save();
      const result = await guildTerritory.getMapControl(map);
      expect(result).toBeNull();
    });
  });

  describe("getTerritoryOwnedByMap", () => {
    it("should return the guild that owns the given map", async () => {
      const map = "TestMap";
      testGuild.territoriesOwned = [{ map, lootShare: 15, controlPoint: true }];

      jest.spyOn(Guild, "findOne").mockReturnValue({ lean: jest.fn().mockResolvedValue(testGuild) } as any);

      const result = await guildTerritory.getGuildByTerritoryMap(map);

      expect(result).toEqual(testGuild);
    });

    it("should return null if no guild owns the given map", async () => {
      const map = "TestMap";
      jest.spyOn(Guild, "findOne").mockReturnValue({ lean: jest.fn().mockResolvedValue(null) } as any);

      const result = await guildTerritory.getGuildByTerritoryMap(map);

      expect(result).toBeNull();
    });
  });

  describe("setMapControl", () => {
    it("should set initial map control when no guild controls the map", async () => {
      const map = "test-map";

      jest.spyOn(guildTerritory, "getGuildByTerritoryMap").mockResolvedValue(null);

      jest.spyOn(guildTerritory, "getMapControl").mockResolvedValue(testGuild);
      // @ts-ignore
      const removeTerritoriesSpy = jest.spyOn(guildTerritory, "removeTerritoriesForMap").mockResolvedValue(undefined);
      const updateOneSpy = jest.spyOn(Guild, "updateOne").mockResolvedValue({} as any);
      // @ts-ignore
      const spySendEventToAllUsers = jest.spyOn(guildTerritory.guildCommon, "sendMessageToAllMembers");

      await guildTerritory.trySetMapControl(map);

      expect(removeTerritoriesSpy).toHaveBeenCalledWith(map);
      expect(updateOneSpy).toHaveBeenCalledWith(
        { _id: testGuild._id },
        { $push: { territoriesOwned: { map, lootShare: 15, controlPoint: true } } }
      );
      expect(spySendEventToAllUsers).toHaveBeenCalledWith(
        `${testGuild.name} has taken control of Test Map.`,
        testGuild
      );
    });

    it("should transfer map control when a new guild gains highest points", async () => {
      const map = "TestMap";

      // Mock the old control (previously controlling guild)
      const oldControlGuild = {
        _id: "1234",
        name: "Old Guild",
        territoriesOwned: [{ map, lootShare: 15, controlPoint: true }],
      } as IGuild;

      // Mock the new guild (current highest points guild)
      jest.spyOn(guildTerritory, "getGuildByTerritoryMap").mockResolvedValue(oldControlGuild);
      jest.spyOn(guildTerritory, "getMapControl").mockResolvedValue(testGuild);

      // @ts-ignore
      const removeTerritoriesSpy = jest.spyOn(guildTerritory, "removeTerritoriesForMap").mockResolvedValue(undefined);
      const updateOneSpy = jest.spyOn(Guild, "updateOne").mockResolvedValue({} as any);
      // @ts-ignore
      const spySendEventToAllMembers = jest.spyOn(guildTerritory.guildCommon, "sendMessageToAllMembers");
      // @ts-ignore
      const spyDiscordBotSendMessage = jest.spyOn(guildTerritory.discordBot, "sendMessage");

      await guildTerritory.trySetMapControl(map);

      const formattedMapName = guildTerritory.getFormattedTerritoryName(map);
      expect(spySendEventToAllMembers).toHaveBeenCalledWith(
        `😈 ${testGuild.name} has stolen the control of ${formattedMapName} from ${oldControlGuild.name}.`,
        testGuild
      );

      expect(spyDiscordBotSendMessage).toHaveBeenCalledWith(
        `😈 ${testGuild.name} has stolen the control of ${formattedMapName} from ${oldControlGuild.name}.`,
        "guilds"
      );

      expect(removeTerritoriesSpy).toHaveBeenCalledWith(map);
      expect(updateOneSpy).toHaveBeenCalledWith(
        { _id: testGuild._id },
        { $push: { territoriesOwned: { map, lootShare: 15, controlPoint: true } } }
      );
    });

    it("should do nothing if the guild already owns the map", async () => {
      const map = testGuild.territoriesOwned[0].map;

      jest.spyOn(guildTerritory, "getMapControl").mockResolvedValue(testGuild);
      // @ts-ignore
      const removeTerritoriesSpy = jest.spyOn(guildTerritory, "removeTerritoriesForMap");
      const updateOneSpy = jest.spyOn(Guild, "updateOne");

      await guildTerritory.trySetMapControl(map);

      expect(removeTerritoriesSpy).not.toHaveBeenCalled();
      expect(updateOneSpy).not.toHaveBeenCalled();
    });
  });

  describe("getTerritoryLootShare", () => {
    it("should return the correct loot share for a guild that owns the territory", () => {
      const map = "TestMap";
      testGuild.territoriesOwned = [{ map, lootShare: 20, controlPoint: true }];

      const result = guildTerritory.getTerritoryLootShare(testGuild, map);

      expect(result).toEqual(20);
    });

    it("should return 0 if the guild does not own the territory", () => {
      const map = "TestMap";
      testGuild.territoriesOwned = [{ map: "OtherMap", lootShare: 15, controlPoint: true }];

      const result = guildTerritory.getTerritoryLootShare(testGuild, map);

      expect(result).toEqual(0);
    });

    it("should return 0 if lootShare is not defined for the territory", () => {
      const map = "TestMap";
      // @ts-ignore
      testGuild.territoriesOwned = [{ map, controlPoint: true }];

      const result = guildTerritory.getTerritoryLootShare(testGuild, map);

      expect(result).toEqual(0);
    });
  });
});
