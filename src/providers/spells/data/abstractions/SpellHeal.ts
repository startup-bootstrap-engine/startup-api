import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { Locker } from "@providers/locks/Locker";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { BasicAttribute, CharacterSocketEvents, EntityType, ICharacterAttributeChanged } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { round } from "lodash";
import { SpellCalculator } from "./SpellCalculator";

interface IHealRange {
  min: number;
  max: number;
}

@provide(SpellHeal)
export class SpellHeal {
  constructor(
    private socketMessaging: SocketMessaging,
    private spellCalculator: SpellCalculator,
    private locker: Locker
  ) {}

  @TrackNewRelicTransaction()
  public async healTarget(caster: ICharacter, target: ICharacter | INPC, range: IHealRange): Promise<void> {
    try {
      const canProceed = await this.locker.lock(`${target._id}-healing-target`);

      if (!canProceed) {
        return;
      }

      const { min, max } = range;

      const healingModifier =
        (await this.spellCalculator.calculateBasedOnSkillLevel(caster, BasicAttribute.Magic, {
          min,
          max,
          formulaType: "sigmoid",
        })) / 100;

      const healthBoost = round(target.maxHealth * healingModifier);

      let newHealth = target.health + healthBoost;

      if (newHealth >= target.maxHealth) {
        newHealth = target.maxHealth; // avoid exceeding maxHealth
      }

      if (target.type === EntityType.Character) {
        await Character.findByIdAndUpdate(target._id, {
          health: newHealth,
        });
      }

      if (target.type === EntityType.NPC) {
        await NPC.findByIdAndUpdate(target._id, {
          health: newHealth,
        });
      }

      const payload: ICharacterAttributeChanged = {
        targetId: target.id,
        health: newHealth,
      };

      await this.socketMessaging.sendEventToCharactersAroundCharacter(
        caster,
        CharacterSocketEvents.AttributeChanged,
        payload,
        true
      );
    } catch (error) {
      console.error(error);
    } finally {
      await this.locker.unlock(`${target._id}-healing-target`);
    }
  }
}
