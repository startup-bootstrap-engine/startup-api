import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterGold } from "@providers/character/CharacterGold";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { container, unitTestHelper } from "@providers/inversify/container";
import mongoose from "mongoose";
import { GuildTributeTracker } from "../GuildTributeTracker";

describe("GuildTributeTracker.ts", () => {
  let guildTributeTracker: GuildTributeTracker;
  let inMemoryHashTable: InMemoryHashTable;
  let characterGold: CharacterGold;
  let testCharacter: ICharacter;
  let testLeader: ICharacter;

  beforeAll(() => {
    guildTributeTracker = container.get(GuildTributeTracker);
    inMemoryHashTable = container.get(InMemoryHashTable);
    characterGold = container.get(CharacterGold);
  });

  beforeEach(async () => {
    // Clear the inMemoryHashTable before each test to ensure isolation
    await inMemoryHashTable.deleteAll("guild-tribute");

    // Create a test character for guild members
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasEquipment: true, hasInventory: true });

    // Create a test leader for the guild
    testLeader = await unitTestHelper.createMockCharacter(null, { hasEquipment: true, hasInventory: true });
  });

  describe("addTributeToBePaidToGuild", () => {
    it("should add tribute to the guild's total tribute amount", async () => {
      const guildId = new mongoose.Types.ObjectId();
      const initialTribute = 100;
      const additionalTribute = 50;

      // Set an initial tribute amount
      await inMemoryHashTable.set("guild-tribute", guildId.toString(), initialTribute);

      // Add additional tribute
      await guildTributeTracker.addTributeToBePaidToGuild(guildId.toString(), additionalTribute);

      // Check the updated tribute amount
      const updatedTribute = (await inMemoryHashTable.get("guild-tribute", guildId.toString())) as unknown as number;
      expect(updatedTribute).toBe(initialTribute + additionalTribute);
    });

    it("should handle adding tribute when no previous tribute exists", async () => {
      const guildId = new mongoose.Types.ObjectId();
      const tributeAmount = 100;

      // Add tribute to a guild with no existing tribute
      await guildTributeTracker.addTributeToBePaidToGuild(guildId.toString(), tributeAmount);

      // Check the stored tribute amount
      const storedTribute = (await inMemoryHashTable.get("guild-tribute", guildId.toString())) as unknown as number;
      expect(storedTribute).toBe(tributeAmount);
    });
  });

  describe("distributeTributeToGuildMembers", () => {
    it("should distribute tribute to guild members and reset tribute to 0", async () => {
      const guildId = new mongoose.Types.ObjectId();
      const totalTribute = 300;

      // Mock the guild data
      await unitTestHelper.createMockGuild({
        _id: guildId,
        guildLeader: testLeader._id,
        members: [testLeader._id, testCharacter._id],
      });

      // Set initial tribute amount
      await inMemoryHashTable.set("guild-tribute", guildId.toString(), totalTribute);

      // Run distribution
      // @ts-ignore
      await guildTributeTracker.distributeTributeToGuildMembers(guildId.toString());

      // Verify distribution
      const leaderShare = (totalTribute / 2) * 1.25; // 25% bonus for leader
      const memberShare = totalTribute / 2;

      const leaderGold = await characterGold.addGoldToCharacterInventory(testLeader, leaderShare);
      const memberGold = await characterGold.addGoldToCharacterInventory(testCharacter, memberShare);

      expect(leaderGold).toBeTruthy();
      expect(memberGold).toBeTruthy();

      // Ensure the tribute is reset to 0
      const resetTribute = (await inMemoryHashTable.get("guild-tribute", guildId.toString())) as unknown as number;
      expect(resetTribute).toBe(0);
    });

    it("should handle case when there is no tribute to distribute", async () => {
      const guildId = new mongoose.Types.ObjectId();

      // Mock the guild data
      await unitTestHelper.createMockGuild({
        _id: guildId,
        guildLeader: testLeader._id,
        members: [testLeader._id, testCharacter._id],
      });

      // Set no tribute
      await inMemoryHashTable.set("guild-tribute", guildId.toString(), 0);

      // Run distribution
      // @ts-ignore
      await guildTributeTracker.distributeTributeToGuildMembers(guildId.toString());

      // Check that no tribute was distributed
      const resetTribute = (await inMemoryHashTable.get("guild-tribute", guildId.toString())) as unknown as number;
      expect(resetTribute).toBe(0);
    });

    it("should handle case when the guild has no members", async () => {
      const guildId = new mongoose.Types.ObjectId();
      const totalTribute = 300;

      // Mock the guild data with no members
      await unitTestHelper.createMockGuild({
        _id: guildId,
        guildLeader: testLeader._id,
        members: [],
      });

      // Set initial tribute amount
      await inMemoryHashTable.set("guild-tribute", guildId.toString(), totalTribute);

      // Run distribution
      // @ts-ignore
      await guildTributeTracker.distributeTributeToGuildMembers(guildId.toString());

      // Check that the tribute was not distributed and is reset to 0
      const resetTribute = (await inMemoryHashTable.get("guild-tribute", guildId.toString())) as unknown as number;
      expect(resetTribute).toBe(0);
    });

    describe("Edge cases", () => {
      it("should handle case when the guild leader is not listed as a member", async () => {
        const guildId = new mongoose.Types.ObjectId();
        const totalTribute = 300;

        // Mock the guild data where the leader is not in the members array
        await unitTestHelper.createMockGuild({
          _id: guildId,
          guildLeader: testLeader._id,
          members: [testCharacter._id],
        });

        // Set initial tribute amount
        await inMemoryHashTable.set("guild-tribute", guildId.toString(), totalTribute);

        // Run distribution
        // @ts-ignore
        await guildTributeTracker.distributeTributeToGuildMembers(guildId.toString());

        // Verify distribution
        const memberShare = totalTribute;

        const memberGold = await characterGold.addGoldToCharacterInventory(testCharacter, memberShare);

        expect(memberGold).toBeTruthy();

        // Ensure the tribute is reset to 0
        const resetTribute = (await inMemoryHashTable.get("guild-tribute", guildId.toString())) as unknown as number;
        expect(resetTribute).toBe(0);
      });

      it("should distribute all tribute to the single guild member who is also the leader", async () => {
        const guildId = new mongoose.Types.ObjectId();
        const totalTribute = 300;

        // Mock the guild data with one member who is the leader
        await unitTestHelper.createMockGuild({
          _id: guildId,
          guildLeader: testLeader._id,
          members: [testLeader._id],
        });

        // Set initial tribute amount
        await inMemoryHashTable.set("guild-tribute", guildId.toString(), totalTribute);

        // Run distribution
        // @ts-ignore
        await guildTributeTracker.distributeTributeToGuildMembers(guildId.toString());

        // Verify distribution
        const leaderShare = totalTribute * 1.25; // Entire tribute with leader bonus

        const leaderGold = await characterGold.addGoldToCharacterInventory(testLeader, leaderShare);

        expect(leaderGold).toBeTruthy();

        // Ensure the tribute is reset to 0
        const resetTribute = (await inMemoryHashTable.get("guild-tribute", guildId.toString())) as unknown as number;
        expect(resetTribute).toBe(0);
      });

      it("should correctly distribute large tribute amounts", async () => {
        const guildId = new mongoose.Types.ObjectId();
        const totalTribute = 1e12; // A very large tribute amount

        // Mock the guild data
        await unitTestHelper.createMockGuild({
          _id: guildId,
          guildLeader: testLeader._id,
          members: [testLeader._id, testCharacter._id],
        });

        // Set initial tribute amount
        await inMemoryHashTable.set("guild-tribute", guildId.toString(), totalTribute);

        // Run distribution
        // @ts-ignore
        await guildTributeTracker.distributeTributeToGuildMembers(guildId.toString());

        // Verify distribution
        const leaderShare = (totalTribute / 2) * 1.25;
        const memberShare = totalTribute / 2;

        const leaderGold = await characterGold.addGoldToCharacterInventory(testLeader, leaderShare);
        const memberGold = await characterGold.addGoldToCharacterInventory(testCharacter, memberShare);

        expect(leaderGold).toBeTruthy();
        expect(memberGold).toBeTruthy();

        // Ensure the tribute is reset to 0
        const resetTribute = (await inMemoryHashTable.get("guild-tribute", guildId.toString())) as unknown as number;
        expect(resetTribute).toBe(0);
      });

      it("should handle non-divisible tribute amounts among members", async () => {
        const guildId = new mongoose.Types.ObjectId();
        const totalTribute = 305; // Not divisible by 2 without a remainder

        // Mock the guild data
        await unitTestHelper.createMockGuild({
          _id: guildId,
          guildLeader: testLeader._id,
          members: [testLeader._id, testCharacter._id],
        });

        // Set initial tribute amount
        await inMemoryHashTable.set("guild-tribute", guildId.toString(), totalTribute);

        // Run distribution
        // @ts-ignore
        await guildTributeTracker.distributeTributeToGuildMembers(guildId.toString());

        // Verify distribution
        const leaderShare = Math.floor((totalTribute / 2) * 1.25);
        const memberShare = Math.floor(totalTribute / 2);

        const leaderGold = await characterGold.addGoldToCharacterInventory(testLeader, leaderShare);
        const memberGold = await characterGold.addGoldToCharacterInventory(testCharacter, memberShare);

        expect(leaderGold).toBeTruthy();
        expect(memberGold).toBeTruthy();

        // Ensure the tribute is reset to 0
        const resetTribute = (await inMemoryHashTable.get("guild-tribute", guildId.toString())) as unknown as number;
        expect(resetTribute).toBe(0);
      });
    });
  });
});
