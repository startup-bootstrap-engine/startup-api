import { INPC } from "@entities/ModuleNPC/NPCModel";
import { Quest } from "@entities/ModuleQuest/QuestModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { provide } from "inversify-binding-decorators";

@provide(NPCQuest)
export class NPCQuest {
  @TrackNewRelicTransaction()
  public async hasQuest(npc: INPC): Promise<boolean> {
    // eslint-disable-next-line mongoose-lean/require-lean
    const npcQuests = await Quest.find({ npcId: npc._id });
    return !!npcQuests.length;
  }
}
