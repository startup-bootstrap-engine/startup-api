import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { NPC } from "@entities/ModuleNPC/NPCModel";
import { IQuestObjectiveInteraction, QuestObjectiveInteraction } from "@entities/ModuleQuest/QuestObjectiveModel";
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
  IQuest,
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

              // Update interaction quest for character (if has any)
              await this.updateRelevantQuests(character, npc.baseKey);

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

  private async updateRelevantQuests(character: ICharacter, npcKey: string): Promise<void> {
    const questRecords = await QuestRecord.find({
      character: character._id,
      status: QuestStatus.InProgress,
    })
      .populate({
        path: "quest",
        populate: {
          path: "objectives",
          model: QuestObjectiveInteraction,
        },
      })
      .lean();

    for (const record of questRecords) {
      const quest = record.quest as IQuest;
      if (!quest || !quest.objectives) continue;

      for (const objective of quest.objectives) {
        const interactionObjective = objective as IQuestObjectiveInteraction;

        if (interactionObjective.type === QuestType.Interaction && interactionObjective.targetNPCkey === npcKey) {
          await this.questSystem.updateQuests(QuestType.Interaction, character, npcKey);
          return; // Exit after updating the first matching quest
        }
      }
    }
  }
}
