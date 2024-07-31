import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterDeath } from "@providers/character/CharacterDeath/CharacterDeath";
import { GENERATE_BLOOD_ON_DEATH } from "@providers/constants/BattleConstants";
import { NPCDeathQueue } from "@providers/npc/NPCDeathQueue";
import { NPCExperience } from "@providers/npc/NPCExperience/NPCExperience";
import { NPCTarget } from "@providers/npc/movement/NPCTarget";
import { QuestSystem } from "@providers/quest/QuestSystem";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { EntityType, QuestType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { random } from "lodash";
import { BattleEffects } from "../BattleEffects";
import { BattleNetworkStopTargeting } from "../network/BattleNetworkStopTargetting";

@provide(BattleAttackTargetDeath)
export class BattleAttackTargetDeath {
  constructor(
    private battleEffects: BattleEffects,
    private characterDeath: CharacterDeath,
    private npcTarget: NPCTarget,
    private npcDeath: NPCDeathQueue,
    private questSystem: QuestSystem,
    private battleNetworkStopTargeting: BattleNetworkStopTargeting,
    private npcExperience: NPCExperience,
    private newRelic: NewRelic
  ) {}

  @TrackNewRelicTransaction()
  public async handleDeathAfterHit(attacker: ICharacter | INPC, target: ICharacter | INPC): Promise<void> {
    if (!target.isAlive || target.health <= 0) {
      const n = random(0, 100);

      if (n <= GENERATE_BLOOD_ON_DEATH) {
        await this.battleEffects.generateBloodOnGround(target);
      }

      if (target.type === EntityType.Character) {
        await this.handleCharacterDeath(attacker, target as ICharacter);

        if (attacker.type === EntityType.Character) {
          this.newRelic.trackMetric(NewRelicMetricCategory.Count, NewRelicSubCategory.Characters, "PVP/Death", 1);
        }
        if (attacker.type === EntityType.NPC) {
          this.newRelic.trackMetric(NewRelicMetricCategory.Count, NewRelicSubCategory.Characters, "Mob/Death", 1);
        }
      } else if (target.type === EntityType.NPC) {
        await this.handleNPCDeath(attacker, target as INPC);
      }
    }
  }

  private async handleCharacterDeath(attacker: ICharacter | INPC, targetCharacter: ICharacter): Promise<void> {
    await this.characterDeath.handleCharacterDeath(attacker, targetCharacter);

    if (attacker.type === EntityType.NPC) {
      await this.npcTarget.clearTarget(attacker as INPC);
      await this.npcTarget.tryToSetTarget(attacker as INPC);
    } else {
      await this.battleNetworkStopTargeting.stopTargeting(attacker as ICharacter);
    }
  }

  private async handleNPCDeath(attacker: ICharacter | INPC, targetNPC: INPC): Promise<void> {
    await this.npcDeath.handleNPCDeath(attacker as ICharacter, targetNPC);

    if (attacker.type === EntityType.Character) {
      await this.questSystem.updateQuests(QuestType.Kill, attacker as ICharacter, targetNPC.key);
      await this.battleNetworkStopTargeting.stopTargeting(attacker as ICharacter);
    }
  }
}
