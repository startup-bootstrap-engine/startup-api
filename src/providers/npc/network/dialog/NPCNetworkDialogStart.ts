import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { Quest } from "@entities/ModuleQuest/QuestModel";
import { QuestObjectiveInteraction } from "@entities/ModuleQuest/QuestObjectiveModel";
import { QuestRecord } from "@entities/ModuleQuest/QuestRecordModel";
import { MathHelper } from "@providers/math/MathHelper";
import { QuestSystem } from "@providers/quest/QuestSystem";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { InterpolationParser } from "@providers/text/InterpolationParser";
import {
  GRID_WIDTH,
  INPCGetInfoEmitterClient,
  INPCStartDialog,
  NPCMovementType,
  NPCSocketEvents,
  NPCTargetType,
  NPC_MAX_TALKING_DISTANCE_IN_GRID,
  QuestStatus,
  QuestType,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(NPCNetworkDialogStart)
export class NPCNetworkDialogStart {
  constructor(
    private socketAuth: SocketAuth,
    private mathHelper: MathHelper,
    private socketMessaging: SocketMessaging,
    private interpolationParser: InterpolationParser,
    private questSystem: QuestSystem
  ) {}

  public onDialogStart(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      NPCSocketEvents.NPCTalkToNPC,
      async (data: INPCGetInfoEmitterClient, character) => {
        try {
          // eslint-disable-next-line mongoose-lean/require-lean
          const npc = await NPC.findOne({
            _id: data.npcId,
          });

          if (!npc) {
            throw new Error(`NPCTalkToNPC > NPC not found: ${data.npcId}`);
          }

          if (!npc.dialogText) {
            throw new Error(`NPCTalkToNPC > NPC has no dialog: ${data.npcId}`);
          }

          const distanceCharNPC = this.mathHelper.getDistanceBetweenPoints(npc.x, npc.y, character.x, character.y);

          const isUnderRange = distanceCharNPC <= NPC_MAX_TALKING_DISTANCE_IN_GRID * GRID_WIDTH;
          if (isUnderRange) {
            npc.currentMovementType = NPCMovementType.Stopped;
            npc.targetType = NPCTargetType.Talking;
            npc.targetCharacter = character._id;
            // eslint-disable-next-line mongoose-lean/require-lean
            await npc.save();

            const dialogText = this.interpolationParser.parseDialog(npc.dialogText, character, npc);

            if (dialogText) {
              this.socketMessaging.sendEventToUser<INPCStartDialog>(
                character.channelId!,
                NPCSocketEvents.NPCStartDialogNPC,
                {
                  npcId: npc._id,
                  dialogText,
                }
              );

              const hasQuestWithNPC = await this.doesNPCHasInProgressQuestWithCharacter(npc, character._id);
              // Update interaction quest for character (if has any)
              if (hasQuestWithNPC) {
                await this.questSystem.updateQuests(QuestType.Interaction, character, npc.baseKey);
              }

              setTimeout(async () => {
                await NPC.findByIdAndUpdate(
                  { _id: npc._id },
                  {
                    $set: {
                      currentMovementType: npc.originalMovementType,
                      targetCharacter: undefined,
                      targetType: NPCTargetType.Default,
                    },
                  }
                );
              }, 60 * 1000);
            } else {
              throw new Error(`NPCTalkToNPC > NPC dialogText is empty: ${npc._id}`);
            }
          } else {
            this.socketMessaging.sendErrorMessageToCharacter(character, "You are too far away to talk to this NPC.");
          }
        } catch (error) {
          console.error(error);
          throw error;
        }
      }
    );
  }

  private async doesNPCHasInProgressQuestWithCharacter(npc: INPC, characterId: string): Promise<boolean> {
    const inProgressQuestsFromCharacter = await QuestRecord.find({
      character: characterId,
      status: QuestStatus.InProgress,
    }).lean();

    for (const questRecord of inProgressQuestsFromCharacter) {
      const isInteractive = await QuestObjectiveInteraction.findOne({
        _id: questRecord.objective,
      }).lean();

      if (!isInteractive) {
        continue;
      }

      const quest = await Quest.findOne({
        _id: questRecord.quest,
        npcId: npc._id,
      }).lean();
      if (quest) {
        return true;
      }
    }

    return false;
  }
}
