import { ItemSeeder } from "@providers/item/ItemSeeder";
import { QuestSeeder } from "@providers/quest/QuestSeeder";

import { NPCRaidSeeder } from "@providers/raid/NPCRaidSeeder";
import { provide } from "inversify-binding-decorators";
import { NPCSeeder } from "../npc/NPCSeeder";
import { RedisCleanup } from "./RedisCleanup";

@provide(Seeder)
export class Seeder {
  constructor(
    private npcSeeder: NPCSeeder,
    private itemSeeder: ItemSeeder,
    private questSeeder: QuestSeeder,
    private npcRaidSeeder: NPCRaidSeeder,
    private redisCleanup: RedisCleanup
  ) {}

  public async start(): Promise<void> {
    console.time("🌱 Total Seeding");

    await this.timeSeeder(this.npcSeeder, "NPC Seeding");
    await this.timeSeeder(this.itemSeeder, "Item Seeding");
    await this.timeSeeder(this.questSeeder, "Quest Seeding");
    await this.timeSeeder(this.npcRaidSeeder, "NPC Raid Seeding");
    await this.timeSeeder(this.redisCleanup, "Redis Cleanup");

    console.timeEnd("🌱 Total Seeding");
  }

  private async timeSeeder(seeder: { seed: () => Promise<void> }, label: string): Promise<void> {
    console.time(`🌱 ${label}`);
    await seeder.seed();
    console.timeEnd(`🌱 ${label}`);
  }
}
