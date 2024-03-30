import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { TraitGetter } from "@providers/skill/TraitGetter";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SpellCalculator } from "@providers/spells/data/abstractions/SpellCalculator";
import { NewRelicTransactionCategory } from "@providers/types/NewRelicTypes";
import { BasicAttribute, CharacterClass, CharacterSocketEvents, ICharacterAttributeChanged } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { CharacterMonitorInterval } from "../CharacterMonitorInterval/CharacterMonitorInterval";

@provide(WarriorPassiveHabilities)
export class WarriorPassiveHabilities {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterMonitorInterval: CharacterMonitorInterval,
    private traitGetter: TraitGetter,
    private newRelic: NewRelic,
    private spellCalculator: SpellCalculator
  ) {}

  public async warriorAutoRegenHealthHandler(character: ICharacter): Promise<void> {
    if (!character) {
      return;
    }

    const { _id, skills } = character;

    if (character.class !== CharacterClass.Warrior) {
      await this.characterMonitorInterval.unwatch("health-regen", character, "Not a warrior");
      return;
    }

    try {
      const charSkills = (await Skill.findById(skills)
        .lean()
        .cacheQuery({
          cacheKey: `${character?._id}-skills`,
        })) as unknown as ISkill;

      const strengthLvl = await this.traitGetter.getSkillLevelWithBuffs(charSkills as ISkill, BasicAttribute.Strength);
      const healthRegenAmount = Math.max(Math.floor(strengthLvl / 3), 4);

      const intervalMs = await this.spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Strength, {
        min: 7000,
        max: 25000,
        skillAssociation: "reverse",
      });

      await this.characterMonitorInterval.watch(
        "health-regen",
        character,
        async () => {
          await this.newRelic.trackTransaction(
            NewRelicTransactionCategory.Interval,
            "WarriorAutoRegenHealthHandler",
            async () => {
              try {
                const refreshCharacter = (await Character.findById(_id)
                  .lean()
                  .select("_id health maxHealth")) as ICharacter;

                if (refreshCharacter.health >= refreshCharacter.maxHealth) {
                  return;
                }

                if (isNaN(strengthLvl) || isNaN(refreshCharacter.health) || isNaN(refreshCharacter.maxHealth)) {
                  throw new Error("Invalid values: All values must be numbers");
                }

                const updatedCharacter = (await Character.findByIdAndUpdate(
                  _id,
                  {
                    health: Math.min(refreshCharacter.health + healthRegenAmount, refreshCharacter.maxHealth),
                  },
                  {
                    new: true,
                  }
                )
                  .lean()
                  .select("_id health channelId")) as ICharacter;

                if (updatedCharacter.health === updatedCharacter.maxHealth) {
                  return;
                }

                const payload: ICharacterAttributeChanged = {
                  targetId: updatedCharacter._id,
                  health: updatedCharacter.health,
                };

                this.socketMessaging.sendEventToUser(
                  updatedCharacter.channelId!,
                  CharacterSocketEvents.AttributeChanged,
                  payload
                );
              } catch (err) {
                console.error("Error during health regeneration interval:", err);
                await this.characterMonitorInterval.unwatch(
                  "health-regen",
                  character,
                  "Error during health regeneration interval"
                );
              }
            }
          );
        },
        intervalMs
      );
    } catch (err) {
      console.error(err);
    }
  }
}
