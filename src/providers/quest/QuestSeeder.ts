import { IQuest as IQuestModel, Quest } from "@entities/ModuleQuest/QuestModel";
import {
  IQuestObjectiveInteraction,
  IQuestObjectiveKill,
  QuestObjectiveInteraction,
  QuestObjectiveKill,
} from "@entities/ModuleQuest/QuestObjectiveModel";
import { QuestReward } from "@entities/ModuleQuest/QuestRewardModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { IQuest, QuestType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import _ from "lodash";
import { QuestLoader } from "./QuestLoader";

@provide(QuestSeeder)
export class QuestSeeder {
  constructor(private questLoader: QuestLoader) {}

  @TrackNewRelicTransaction()
  public async seed(): Promise<void> {
    const questSeedData = await this.questLoader.loadQuestSeedData();

    if (_.isEmpty(questSeedData)) {
      console.log("🤷 No Quest data to seed");
    }

    const questPromises = questSeedData.map(async (questData) => {
      const questFound = (await Quest.findOne({
        npcId: questData.npcId,
        key: questData.key,
      }).lean()) as unknown as IQuestModel;

      if (!questFound) {
        await this.createNewQuest(questData as IQuest);
      }
    });

    await Promise.all(questPromises);
  }

  private async createNewQuest(QuestData: IQuest): Promise<void> {
    try {
      const newQuestData: Partial<IQuest> = {
        npcId: QuestData.npcId,
        title: QuestData.title,
        key: QuestData.key,
        description: QuestData.description,
        rewards: [],
        objectives: [],
      };

      for (const reward of QuestData.rewards) {
        let newReward = new QuestReward({
          ...reward,
        });
        // eslint-disable-next-line mongoose-lean/require-lean
        newReward = await newReward.save();
        newQuestData.rewards!.push(newReward._id);
      }

      let newQuest = new Quest({
        ...newQuestData,
      });
      // eslint-disable-next-line mongoose-lean/require-lean
      newQuest = await newQuest.save();

      for (const obj of QuestData.objectives) {
        let newObj: IQuestObjectiveKill | IQuestObjectiveInteraction;
        switch (obj.type) {
          case QuestType.Kill:
            newObj = new QuestObjectiveKill({
              ...obj,
            });
            // eslint-disable-next-line mongoose-lean/require-lean
            newObj = await newObj.save();
            break;
          case QuestType.Interaction:
            newObj = new QuestObjectiveInteraction({
              ...obj,
            });
            // eslint-disable-next-line mongoose-lean/require-lean
            newObj = await newObj.save();
            break;
          default:
            throw new Error(`Invalid quest type ${obj.type}`);
        }
        newQuest.objectives!.push(newObj._id);
      }
      // eslint-disable-next-line mongoose-lean/require-lean
      await newQuest.save();
    } catch (error) {
      console.log(`❌ Failed to spawn Quest ${QuestData.key}. Is the blueprint for this Quest missing?`);
      console.error(error);
    }
  }
}
