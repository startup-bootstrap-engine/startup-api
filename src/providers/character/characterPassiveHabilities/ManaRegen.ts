import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import {
  MANA_REGEN_MAGIC_LEVEL_DIVISOR,
  MANA_REGEN_MAX_REGEN_INTERVAL,
  MANA_REGEN_MIN_MANA_REGEN,
  MANA_REGEN_MIN_REGEN_INTERVAL,
} from "@providers/constants/ManaRegenConstant";
import { PREMIUM_ACCOUNT_METADATA } from "@providers/constants/PremiumAccountConstants";
import { TraitGetter } from "@providers/skill/TraitGetter";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SpellCalculator } from "@providers/spells/data/abstractions/SpellCalculator";
import { NewRelicTransactionCategory } from "@providers/types/NewRelicTypes";
import {
  BasicAttribute,
  CharacterClass,
  CharacterSocketEvents,
  ICharacterAttributeChanged,
  UserAccountTypes,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { CharacterMonitorInterval } from "../CharacterMonitorInterval/CharacterMonitorInterval";
import { CharacterPremiumAccount } from "../CharacterPremiumAccount";

@provide(ManaRegen)
export class ManaRegen {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterMonitorInterval: CharacterMonitorInterval,
    private traitGetter: TraitGetter,
    private newRelic: NewRelic,
    private spellCalculator: SpellCalculator,
    private characterPremiumAccount: CharacterPremiumAccount
  ) {}

  @TrackNewRelicTransaction()
  public async autoRegenManaHandler(character: ICharacter): Promise<void> {
    try {
      const skills = await this.getCharacterSkills(character);
      const [accountType, magicLvl] = (await Promise.all([
        this.characterPremiumAccount.getPremiumAccountType(character),
        this.traitGetter.getSkillLevelWithBuffs(skills, BasicAttribute.Magic),
      ])) as [UserAccountTypes, number];

      const skipManaRegen = await this.shouldSkipManaRegen(character, accountType);
      if (skipManaRegen) {
        return;
      }

      const manaRegenAmount = this.calculateManaRegenAmount(character, magicLvl, accountType);
      const intervalMs = await this.calculateRegenInterval(character, magicLvl);

      await this.characterMonitorInterval.watch(
        "mana-regen",
        character,
        async (char) => {
          await this.processManaRegeneration(char, manaRegenAmount);
        },
        intervalMs
      );
    } catch (err) {
      console.error(err);
    }
  }

  private async processManaRegeneration(character: ICharacter, manaRegenAmount: number): Promise<void> {
    await this.newRelic.trackTransaction(NewRelicTransactionCategory.Interval, "AutoRegenManaHandler", async () => {
      try {
        const { _id } = character;

        const refreshCharacter = (await Character.findById(_id).lean().select("_id mana maxMana")) as ICharacter;

        if (refreshCharacter.mana >= refreshCharacter.maxMana) {
          return;
        }

        const updatedCharacter = (await Character.findByIdAndUpdate(
          _id,
          {
            mana: Math.min(refreshCharacter.mana + manaRegenAmount, refreshCharacter.maxMana),
          },
          {
            new: true,
          }
        )
          .lean()
          .select("_id mana channelId")) as ICharacter;

        if (updatedCharacter.mana === updatedCharacter.maxMana) {
          return;
        }

        const payload: ICharacterAttributeChanged = {
          targetId: updatedCharacter._id,
          mana: updatedCharacter.mana,
        };

        this.socketMessaging.sendEventToUser(
          updatedCharacter.channelId!,
          CharacterSocketEvents.AttributeChanged,
          payload
        );
      } catch (err) {
        console.error("Error during mana regeneration interval:", err);
        await this.characterMonitorInterval.unwatch("mana-regen", character);
      }
    });
  }

  private async shouldSkipManaRegen(character: ICharacter, accountType: UserAccountTypes): Promise<boolean> {
    const isFreeAccount = accountType === UserAccountTypes.Free;
    const isNotMage = character.class !== CharacterClass.Sorcerer && character.class !== CharacterClass.Druid;

    if (isFreeAccount && isNotMage) {
      await this.characterMonitorInterval.unwatch("mana-regen", character);
      return true;
    }
    return false;
  }

  private async getCharacterSkills(character: ICharacter): Promise<ISkill> {
    return (await Skill.findById(character.skills)
      .lean({ virtuals: true, defaults: true })
      .cacheQuery({ cacheKey: `${character?._id}-skills` })) as ISkill;
  }

  private calculateManaRegenAmount(character: ICharacter, magicLvl: number, accountType: UserAccountTypes): number {
    const manaRegenPercent = PREMIUM_ACCOUNT_METADATA[accountType].manaRagenPercent;
    let amountAdded = magicLvl / MANA_REGEN_MAGIC_LEVEL_DIVISOR;

    if (character.class === CharacterClass.Sorcerer || character.class === CharacterClass.Druid) {
      amountAdded += (magicLvl / MANA_REGEN_MAGIC_LEVEL_DIVISOR) * manaRegenPercent;
    } else {
      amountAdded *= manaRegenPercent;
    }

    return Math.max(Math.floor(amountAdded), MANA_REGEN_MIN_MANA_REGEN);
  }

  private async calculateRegenInterval(character: ICharacter, magicLvl: number): Promise<number> {
    return await this.spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Magic, {
      max: MANA_REGEN_MAX_REGEN_INTERVAL,
      min: MANA_REGEN_MIN_REGEN_INTERVAL,
      skillAssociation: "reverse",
    });
  }
}
