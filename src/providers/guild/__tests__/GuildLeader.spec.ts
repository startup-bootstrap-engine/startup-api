import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IDepot } from "@entities/ModuleDepot/DepotModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IGuild } from "@entities/ModuleSystem/GuildModel";
import { DepotFinder } from "@providers/depot/DepotFinder";
import { container, unitTestHelper } from "@providers/inversify/container";
import { GuildLeader } from "../GuildLeader";

describe("GuildLeader.ts - Depot Methods", () => {
  let guildLeader: GuildLeader;
  let testGuild: IGuild;
  let testCharacter: ICharacter;
  let testDepot: IDepot;
  let mockItemContainer: IItemContainer;

  beforeAll(() => {
    guildLeader = container.get<GuildLeader>(GuildLeader);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasInventory: true, hasEquipment: true });

    testGuild = await unitTestHelper.createMockGuild({
      guildLeader: testCharacter._id,
      members: [testCharacter._id],
    });

    const mockNPC = await unitTestHelper.createMockNPC();
    testDepot = await unitTestHelper.createMockDepot(mockNPC, testCharacter._id.toString());

    mockItemContainer = await unitTestHelper.createMockItemContainer({ parentItem: testDepot._id });
    testDepot.itemContainer = mockItemContainer._id;
    await testDepot.save();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return the guild leader's depot", async () => {
    jest.spyOn(GuildLeader.prototype, "getGuildLeaderById").mockResolvedValueOnce(testCharacter);
    jest.spyOn(DepotFinder.prototype, "findDepotWithSlots").mockResolvedValueOnce(testDepot as any);

    const result = await guildLeader.getGuildLeaderDepot(testGuild._id);

    expect(result).toEqual(testDepot);
  });

  it("should throw an error if the guild leader's depot is not found", async () => {
    jest.spyOn(GuildLeader.prototype, "getGuildLeaderById").mockResolvedValueOnce(testCharacter);
    // @ts-ignore
    jest.spyOn(DepotFinder.prototype, "findDepotWithSlots").mockResolvedValueOnce(null);

    await expect(guildLeader.getGuildLeaderDepot(testGuild._id)).rejects.toThrow(
      `Depot not found for guild leader: ${testCharacter._id}`
    );
  });

  it("should return the guild leader's depot item container", async () => {
    jest.spyOn(GuildLeader.prototype, "getGuildLeaderDepot").mockResolvedValueOnce(testDepot as any);
    jest.spyOn(ItemContainer, "findById").mockReturnValueOnce({
      lean: jest.fn().mockResolvedValueOnce(mockItemContainer),
    } as any);

    const result = await guildLeader.getGuildLeaderDepotItemContainer(testGuild._id);

    expect(result).toEqual(mockItemContainer);
  });

  it("should throw an error if the guild leader's depot item container is not found", async () => {
    jest.spyOn(GuildLeader.prototype, "getGuildLeaderDepot").mockResolvedValueOnce(testDepot as any);
    jest.spyOn(ItemContainer, "findById").mockReturnValueOnce({
      lean: jest.fn().mockResolvedValueOnce(null),
    } as any);

    await expect(guildLeader.getGuildLeaderDepotItemContainer(testGuild._id)).rejects.toThrow(
      `Depot item container not found for depotId: ${testDepot._id}`
    );
  });

  it("should throw an error if the depot is not found for the guild leader", async () => {
    jest.spyOn(GuildLeader.prototype, "getGuildLeaderDepot").mockResolvedValueOnce(null);

    await expect(guildLeader.getGuildLeaderDepotItemContainer(testGuild._id)).rejects.toThrow(
      `Depot not found for guild leader: ${testGuild._id}`
    );
  });
});
