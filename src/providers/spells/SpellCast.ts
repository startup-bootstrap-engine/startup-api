import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { BattleCharacterAttackValidation } from "@providers/battle/BattleCharacterAttack/BattleCharacterAttackValidation";
import { CharacterPremiumAccount } from "@providers/character/CharacterPremiumAccount";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CharacterBonusPenalties } from "@providers/character/characterBonusPenalties/CharacterBonusPenalties";
import { CharacterItems } from "@providers/character/characterItems/CharacterItems";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { EntityUtil } from "@providers/entityEffects/EntityUtil";
import { blueprintManager } from "@providers/inversify/container";
import { EffectableAttribute, ItemUsableEffect } from "@providers/item/helper/ItemUsableEffect";
import { MapNonPVPZone } from "@providers/map/MapNonPVPZone";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { NamespaceRedisControl } from "@providers/spells/data/types/SpellsBlueprintTypes";
import {
  AnimationEffectKeys,
  BasicAttribute,
  CharacterSocketEvents,
  EntityType,
  ICharacterAttributeChanged,
  ISpell,
  ISpellCast,
  NPCAlignment,
  SpellCastingType,
  SpellSocketEvents,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import SpellCoolDown from "./SpellCooldown";
import { SpellValidation } from "./SpellValidation";
import { spellsBlueprints } from "./data/blueprints/index";
import SpellSilence from "./data/logic/mage/druid/SpellSilence";
import { Stealth } from "./data/logic/rogue/Stealth";

type ITarget = ICharacter | INPC;
@provide(SpellCast)
export class SpellCast {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterValidation: CharacterValidation,
    private animationEffect: AnimationEffect,
    private characterItems: CharacterItems,
    private skillIncrease: SkillIncrease,
    private characterBonusPenalties: CharacterBonusPenalties,
    private itemUsableEffect: ItemUsableEffect,
    private spellValidation: SpellValidation,
    private inMemoryHashTable: InMemoryHashTable,
    private movementHelper: MovementHelper,
    private stealth: Stealth,
    private spellCoolDown: SpellCoolDown,
    private spellSilencer: SpellSilence,
    private mapNonPVPZone: MapNonPVPZone,
    private characterPremiumAccount: CharacterPremiumAccount,
    private battleCharacterAttackValidation: BattleCharacterAttackValidation
  ) {}

  public isSpellCasting(msg: string): boolean {
    return !!this.getSpell(msg);
  }

  @TrackNewRelicTransaction()
  public async castSpell(data: ISpellCast, character: ICharacter): Promise<boolean> {
    try {
      if (!this.characterValidation.hasBasicValidation(character)) {
        return false;
      }

      const spell = this.getSpell(data.magicWords) as ISpell;

      if (!(await this.isSpellCastingValid(spell, character))) {
        return false;
      }

      this.setTargetData(data, character);

      if (this.isRangedSpellWithoutTarget(spell, data)) {
        await this.sendPreSpellCastEvents(spell, character);

        this.sendIdentifyTargetEvent(character, data);

        return false;
      }

      if (spell.castingType === SpellCastingType.SelfCasting) {
        await this.sendPreSpellCastEvents(spell, character);
      }

      const target = await this.getTargetIfValid(spell, data, character).then(
        (target) => target && this.updateTargetSkills(target)
      );
      const [isSpellActivated, isSpellFailed] = await Promise.all([
        this.isSpellAlreadyActivated(spell, character),
        this.isSpellCastFailed(character, target, spell),
      ]);

      if (isSpellActivated || isSpellFailed) {
        return false;
      }

      await Promise.all([
        this.handleSpellCooldown(spell, character),
        this.applySpellEffectsAndUpdateCharacter(character, spell, target as ITarget),
      ]);

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  private setTargetData(data: ISpellCast, character: ICharacter): void {
    if (character.target.id !== undefined && character.target.type !== undefined) {
      data.targetId = character.target.id as unknown as string;
      data.targetType = character.target.type as unknown as EntityType;
    }
  }

  private isRangedSpellWithoutTarget(spell: ISpell, data: ISpellCast): boolean {
    return spell.castingType === SpellCastingType.RangedCasting && (!data.targetType || !data.targetId);
  }

  private async isSpellAlreadyActivated(spell: ISpell, character: ICharacter): Promise<boolean> {
    const namespace = `${NamespaceRedisControl.CharacterSpell}:${character._id}`;
    let key = spell.attribute;
    // @ts-ignore
    key || (key = spell.key);

    if (key) {
      const buffActivated = await this.inMemoryHashTable.has(namespace, key);

      if (buffActivated) {
        this.socketMessaging.sendErrorMessageToCharacter(character, `Sorry, ${spell.name} is already activated.`);
        return true;
      }
    }

    return false;
  }

  private async getTargetIfValid(spell: ISpell, data: ISpellCast, character: ICharacter): Promise<ITarget | null> {
    let target;
    if (spell.castingType === SpellCastingType.RangedCasting) {
      target = await EntityUtil.getEntity(data.targetId!, data.targetType!);
      if (!(await this.isRangedCastingValid(character, target, spell))) {
        return null;
      }
    }

    return target;
  }

  private async updateTargetSkills(target: ITarget): Promise<ITarget> {
    if (target.type === "NPC") {
      await this.updateNPCSkills(target as INPC);
    }
    if (target.type === "Character") {
      await this.updateCharacterSkills(target as ICharacter);
    }

    return target;
  }

  private async updateNPCSkills(target: INPC): Promise<void> {
    const updatedNPCSkills = (await Skill.findOne({ owner: target._id, ownerType: "NPC" })
      .lean({
        virtuals: true,
        defaults: true,
      })
      .cacheQuery({
        cacheKey: `${target._id}-skills`,
      })) as unknown as ISkill;

    target.skills = updatedNPCSkills;
  }

  private async updateCharacterSkills(target: ITarget): Promise<void> {
    target = await Character.findOne({ _id: target._id, scene: target.scene }).lean({
      virtuals: true,
      defaults: true,
    });

    const updatedCharacterSkills = (await Skill.findOne({ owner: target._id, ownerType: "Character" }).cacheQuery({
      cacheKey: `${target._id}-skills`,
    })) as unknown as ISkill;

    target.skills = updatedCharacterSkills;
  }

  private async isSpellCastFailed(
    character: ICharacter,
    target: ITarget | null | undefined,
    spell: ISpell
  ): Promise<boolean> {
    if (!character) {
      return true;
    }

    if (spell.castingType === SpellCastingType.RangedCasting && !target) {
      return true;
    }

    const hasCastSucceeded = await spell.usableEffect(character, target);

    // if it fails, it will return explicitly false above. We prevent moving forward, so mana is not spent unnecessarily
    return hasCastSucceeded === false;
  }

  private async handleSpellCooldown(spell: ISpell, character: ICharacter): Promise<void> {
    const hasSpellCooldown = await this.spellCoolDown.haveSpellCooldown(character, spell.magicWords);

    if (!hasSpellCooldown) {
      await this.spellCoolDown.setSpellCooldown(spell.key, character, spell.magicWords, spell.cooldown);
    }
    await this.spellCoolDown.getAllSpellCooldowns(character);
  }

  private async applySpellEffectsAndUpdateCharacter(
    character: ICharacter,
    spell: ISpell,
    target: ITarget
  ): Promise<void> {
    const updatedCharacter = (await Character.findById(character._id)) as ICharacter;

    await this.itemUsableEffect.apply(updatedCharacter, EffectableAttribute.Mana, -1 * spell.manaCost);
    await updatedCharacter.save();
    await this.sendPostSpellCastEvents(updatedCharacter, spell, target);
    await this.skillIncrease.increaseMagicSP(updatedCharacter, spell.manaCost);

    if (target?.type === EntityType.Character) {
      await this.skillIncrease.increaseMagicResistanceSP(target as ICharacter, spell.manaCost);
    }

    await this.characterBonusPenalties.applyRaceBonusPenalties(updatedCharacter, BasicAttribute.Magic);
  }

  private async isRangedCastingValid(caster: ICharacter, target: ICharacter | INPC, spell: ISpell): Promise<boolean> {
    if (!target) {
      this.socketMessaging.sendErrorMessageToCharacter(
        caster,
        "Sorry, you need to select a valid target to cast this spell."
      );
      return false;
    }

    if (!spell.canSelfTarget) {
      if (caster._id.toString() === target._id?.toString()) {
        this.socketMessaging.sendErrorMessageToCharacter(caster, "Sorry, you can't cast this spell on yourself.");
        return false;
      }
    }

    const isTargetAtPZ = this.mapNonPVPZone.isNonPVPZoneAtXY(target.scene, target.x, target.y);

    if (isTargetAtPZ && target.type === EntityType.Character) {
      this.socketMessaging.sendErrorMessageToCharacter(caster, "Sorry, your target is at a protected zone.");

      return false;
    }

    if (target.type === EntityType.NPC && (target as INPC).alignment === NPCAlignment.Friendly) {
      this.socketMessaging.sendErrorMessageToCharacter(caster, "Sorry, you can't cast this spell on a friendly NPC.");
      return false;
    }

    if (await this.stealth.isInvisible(target)) {
      this.socketMessaging.sendErrorMessageToCharacter(caster, "Sorry, your target is invisible.");
      return false;
    }

    const isUnderRange = this.movementHelper.isUnderRange(
      caster.x,
      caster.y,
      target.x!,
      target.y!,
      spell.maxDistanceGrid || 1
    );
    if (!isUnderRange) {
      this.socketMessaging.sendErrorMessageToCharacter(caster, "Sorry, your target is out of reach.");
      return false;
    }

    const canAttack = await this.battleCharacterAttackValidation.canAttack(caster, target);
    if (!canAttack) {
      return false;
    }

    if (caster.type === EntityType.Character && target.type === EntityType.NPC && spell.isPVPOnly) {
      this.socketMessaging.sendErrorMessageToCharacter(caster, "Sorry, this spell is only available for PVP.");
      return false;
    }
    return true;
  }

  private async isSpellCastingValid(spell: ISpell, character: ICharacter): Promise<boolean> {
    if (!spell) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, spell not found.");
      return false;
    }

    if (!character.learnedSpells || character.learnedSpells.indexOf(spell.key) < 0) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you have not learned this spell.");
      return false;
    }

    const premiumAccountType = await this.characterPremiumAccount.getPremiumAccountType(character);

    if (!premiumAccountType && spell.onlyPremiumAccountType) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, this spell requires a premium account to be casted."
      );
      return false;
    }

    if (premiumAccountType && spell.onlyPremiumAccountType) {
      const isSpellOnPremiumPlan = spell.onlyPremiumAccountType?.includes(premiumAccountType);

      if (!isSpellOnPremiumPlan) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          `Sorry, this spell requires a premium account of type: ${spell.onlyPremiumAccountType?.join(", ")}.`
        );
        return false;
      }
    }

    if (await this.spellSilencer.isSilent(character)) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you are silent. You cannot cast any spell.");
      return false;
    }

    const hasSpellCooldown = await this.spellCoolDown.haveSpellCooldown(character._id, spell.magicWords);
    if (hasSpellCooldown) {
      await this.spellCoolDown.getAllSpellCooldowns(character);
      const timeLeft = await this.spellCoolDown.getTimeLeft(character._id, spell.magicWords);
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        `Sorry, this spell is in cooldown. ${timeLeft} secs left`
      );

      return false;
    }

    if (!this.spellValidation.isAvailableForCharacterClass(spell, character)) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, this spell is not available to your class.");
      return false;
    }

    if (!this.spellValidation.isAvailableForCharacterRace(spell, character)) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, this spell is not available to your race.");
      return false;
    }

    if (character.mana < spell.manaCost) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        `Sorry, this spell requires ${spell.manaCost} of mana to be casted.`
      );
      return false;
    }

    if (spell.requiredItem) {
      const required = await blueprintManager.getBlueprint<IItem>("items", spell.requiredItem);

      if (!required) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          `Sorry, the item required to cast this spell is not available: ${spell.requiredItem}`
        );

        console.info(`❌ SpellCast: Missing item blueprint for key ${spell.requiredItem}`);
        return false;
      }

      const hasItem = await this.characterItems.hasItemByKey(required.key, character, "inventory");
      if (!hasItem) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          `Sorry, you must have a ${required.name} in inventory to cast this spell.`
        );
        return false;
      }
    }

    const updatedCharacter = (await Character.findOne({ _id: character._id }).populate(
      "skills"
    )) as unknown as ICharacter;
    const skills = updatedCharacter.skills as unknown as ISkill;

    if (!skills) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, you can not cast this spell without any skills."
      );
      return false;
    }

    if (skills.level < spell.minLevelRequired) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        `You can't cast spell because it requires level ${spell.minLevelRequired}.`
      );
      return false;
    }

    if (skills.magic.level < spell.minMagicLevelRequired) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        `You can't cast spell because it requires magic level ${spell.minMagicLevelRequired}.`
      );
      return false;
    }

    return true;
  }

  private getSpell(magicWords: string): any {
    for (const key in spellsBlueprints) {
      const spell = spellsBlueprints[key];
      if (spell.magicWords === magicWords.toLocaleLowerCase()) {
        return spell;
      }
    }
    return null;
  }

  private async sendPreSpellCastEvents(spell: ISpell, character: ICharacter): Promise<void> {
    if (spell.castingAnimationKey) {
      await this.animationEffect.sendAnimationEventToCharacter(
        character,
        spell.castingAnimationKey as AnimationEffectKeys
      );
    }
  }

  private async sendPostSpellCastEvents(
    character: ICharacter,
    spell: ISpell,
    target?: ICharacter | INPC
  ): Promise<void> {
    const updatedCharacter = (await Character.findById(character._id).lean({ virtuals: true })) as ICharacter;

    const payload: ICharacterAttributeChanged = {
      targetId: updatedCharacter._id,
      health: updatedCharacter.health,
      mana: updatedCharacter.mana,
      speed: updatedCharacter.speed,
    };

    this.socketMessaging.sendEventToUser(updatedCharacter.channelId!, CharacterSocketEvents.AttributeChanged, payload);

    const sendEventsPromises = [
      this.socketMessaging.sendEventToCharactersAroundCharacter(
        updatedCharacter,
        CharacterSocketEvents.AttributeChanged,
        payload
      ),
    ];

    if (target) {
      if (spell.projectileAnimationKey) {
        sendEventsPromises.push(
          this.animationEffect.sendProjectileAnimationEventToCharacter(
            updatedCharacter,
            updatedCharacter._id,
            target._id,
            spell.projectileAnimationKey
          )
        );
      }

      if (spell.targetHitAnimationKey) {
        sendEventsPromises.push(
          this.animationEffect.sendAnimationEventToCharacter(
            target as ICharacter,
            spell.targetHitAnimationKey as AnimationEffectKeys
          )
        );
      }
    }

    await Promise.all(sendEventsPromises);
  }

  private sendIdentifyTargetEvent(character: ICharacter, data: ISpellCast): void {
    this.socketMessaging.sendEventToUser(character.channelId!, SpellSocketEvents.IdentifyTarget, data);
  }
}
