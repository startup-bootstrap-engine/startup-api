import { NPC } from "@entities/ModuleNPC/NPCModel";
import { provide } from "inversify-binding-decorators";

@provide(NPCDuplicateCleaner)
export class NPCDuplicateCleaner {
  public async cleanupDuplicateNPCs(): Promise<void> {
    try {
      const duplicates = await NPC.aggregate([
        {
          $group: {
            _id: { tiledId: "$tiledId", scene: "$scene" },
            ids: { $push: "$_id" },
          },
        },
        {
          $match: {
            "ids.1": { $exists: true },
          },
        },
      ]);

      let totalDeleted = 0;

      for (const group of duplicates) {
        const idsToDelete = group.ids.slice(1); // Keep the first NPC and prepare to delete the rest
        const deleteResult = await NPC.deleteMany({ _id: { $in: idsToDelete } });
        totalDeleted += deleteResult.deletedCount ?? 0;
      }

      if (totalDeleted > 0) {
        console.log(`⚠️ Total NPCs deleted ${totalDeleted} after duplicate cleanup`);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
