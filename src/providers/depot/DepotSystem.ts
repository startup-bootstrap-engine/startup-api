import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { provide } from "inversify-binding-decorators";

@provide(DepotSystem)
export class DepotSystem {
  /**
   * npcBasicValidation validates if the NPC exists and has depot
   * If validation passes, returns the corresponding NPC
   * @param npcId
   * @returns NPC entity if validation pass
   */
  @TrackNewRelicTransaction()
  public async npcBasicValidation(npcId: string): Promise<INPC> {
    const npc = await NPC.findOne({
      _id: npcId,
    });

    if (!npc) {
      throw new Error(`DepotSystem > NPC not found: ${npcId}`);
    }

    if (!npc.hasDepot) {
      throw new Error(`DepotSystem > NPC does not support depot ('hasDepot' = false): NPC id ${npcId}`);
    }
    return npc;
  }
}
