import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill } from "@entities/ModuleCharacter/SkillsModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { BattleAttackRanged } from "@providers/battle/BattleAttackTarget/BattleAttackRanged";
import { BattleCharacterAttackValidation } from "@providers/battle/BattleCharacterAttack/BattleCharacterAttackValidation";
import { OnTargetHit } from "@providers/battle/OnTargetHit";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CharacterBonusPenalties } from "@providers/character/characterBonusPenalties/CharacterBonusPenalties";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { CharacterItemInventory } from "@providers/character/characterItems/CharacterItemInventory";
import { CharacterWeight } from "@providers/character/weight/CharacterWeight";
import { EntityUtil } from "@providers/entityEffects/EntityUtil";
import { SpecialEffect } from "@providers/entityEffects/SpecialEffect";
import { blueprintManager } from "@providers/inversify/container";
import { AvailableBlueprints } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemValidation } from "@providers/item/validation/ItemValidation";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import {
  BasicAttribute,
  CharacterSocketEvents,
  ICharacterAttributeChanged,
  IEquipmentAndInventoryUpdatePayload,
  IItemContainer,
  IUseWithEntity,
  ItemSocketEvents,
  MagicsBlueprint,
  NPCAlignment,
  UseWithSocketEvents,
} from "@rpg-engine/shared";
import { EntityType } from "@rpg-engine/shared/dist/types/entity.types";
import { provide } from "inversify-binding-decorators";
import { IMagicItemUseWithEntity } from "./useWithTypes";

const StaticEntity = "Item"; // <--- should be added to the EntityType enum from @rpg-engine/shared

@provide(UseWithEntity)
export class UseWithEntity {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterValidation: CharacterValidation,
    private movementHelper: MovementHelper,
    private itemValidation: ItemValidation,
    private socketAuth: SocketAuth,
    private characterItemInventory: CharacterItemInventory,
    private characterWeight: CharacterWeight,
    private animationEffect: AnimationEffect,
    private characterItemContainer: CharacterItemContainer,
    private skillIncrease: SkillIncrease,
    private characterBonusPenalties: CharacterBonusPenalties,
    private onTargetHit: OnTargetHit,
    private battleCharacterAttackValidation: BattleCharacterAttackValidation,
    private battleRangedAttack: BattleAttackRanged,
    private specialEffect: SpecialEffect
  ) {}

  public onUseWithEntity(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      UseWithSocketEvents.UseWithEntity,
      async (data: IUseWithEntity, character) => {
        if (data) {
          await this.execute(data, character);
        }
      }
    );
  }

  public async execute(payload: IUseWithEntity, character: ICharacter): Promise<void> {
    const target = payload.entityId ? await EntityUtil.getEntity(payload.entityId, payload.entityType) : null;
    const item = payload.itemId ? ((await Item.findById(payload.itemId)) as unknown as IItem) : null;

    const isValid = await this.validateRequest(character, target, item, payload.entityType);
    if (!isValid) {
      return;
    }

    await this.executeEffect(character, target!, item!);
  }

  private async validateRequest(
    caster: ICharacter,
    target: ICharacter | INPC | IItem | null,
    item: IItem | null,
    targetType: EntityType | typeof StaticEntity
  ): Promise<boolean> {
    if (!target) {
      this.socketMessaging.sendErrorMessageToCharacter(caster, "Sorry, your target was not found.");
      return false;
    }

    if (!item) {
      this.socketMessaging.sendErrorMessageToCharacter(caster, "Sorry, item you are trying to use was not found.");
      return false;
    }

    const blueprint = await blueprintManager.getBlueprint<IMagicItemUseWithEntity>(
      "items",
      item.baseKey as AvailableBlueprints
    );

    if (!blueprint || !(!!blueprint.power || targetType === StaticEntity) || !blueprint.usableEffect) {
      this.socketMessaging.sendErrorMessageToCharacter(caster, `Sorry, '${item.name}' cannot be used with target.`);
      return false;
    }

    if (!this.characterValidation.hasBasicValidation(caster)) {
      return false;
    }

    if (blueprint.key === MagicsBlueprint.HealRune && target.type === EntityType.NPC) {
      this.socketMessaging.sendErrorMessageToCharacter(caster, `Sorry, '${blueprint.name}' can not be apply on NPC.`);
      return false;
    }

    if (targetType !== EntityType.Item) {
      const isInvisible = await this.specialEffect.isInvisible(target as unknown as ICharacter | INPC);
      if (isInvisible) {
        this.socketMessaging.sendErrorMessageToCharacter(caster, "Sorry, your target is invisible.");
        return false;
      }
    }

    if ("isAlive" in target && !target.isAlive && targetType !== (StaticEntity as EntityType)) {
      this.socketMessaging.sendErrorMessageToCharacter(caster, "Sorry, your target is dead.");
      return false;
    }

    if (caster.target.id && (target.type === EntityType.Character || EntityType.NPC)) {
      if (target.id.toString() !== caster.target.id.toString()) {
        this.socketMessaging.sendErrorMessageToCharacter(caster, "Sorry, your target is invalid.");
        return false;
      }
    }

    if (target.type === EntityType.Character) {
      const customMsg = new Map([
        ["not-online", "Sorry, your target is offline."],
        ["banned", "Sorry, your target is banned."],
      ]);

      if (!this.characterValidation.hasBasicValidation(target as ICharacter, customMsg)) {
        return false;
      }
    } else if ((target as INPC).alignment !== NPCAlignment.Hostile && targetType !== StaticEntity) {
      this.socketMessaging.sendErrorMessageToCharacter(caster, "Sorry, your target is not valid.");
      return false;
    }

    if (caster.scene !== target.scene) {
      this.socketMessaging.sendErrorMessageToCharacter(caster, "Sorry, your target is not on the same scene.");
      return false;
    }

    const isUnderRange = this.movementHelper.isUnderRange(
      caster.x,
      caster.y,
      target.x!,
      target.y!,
      blueprint.useWithMaxDistanceGrid
    );
    if (!isUnderRange) {
      this.socketMessaging.sendErrorMessageToCharacter(caster, "Sorry, your target is out of reach.");
      return false;
    }

    if (!(await this.itemValidation.isItemInCharacterInventory(caster, item._id))) {
      return false;
    }

    const updatedCharacter = (await Character.findOne({ _id: caster._id }).populate("skills")) as unknown as ICharacter;
    const skills = updatedCharacter.skills as unknown as ISkill;
    const casterMagicLevel = skills?.magic?.level ?? 0;

    if (casterMagicLevel < blueprint.minMagicLevelRequired) {
      this.socketMessaging.sendErrorMessageToCharacter(
        caster,
        `Sorry, '${blueprint.name}' can not only be used at magic level '${blueprint.minMagicLevelRequired}' or greater.`
      );
      return false;
    }

    // check there're no solids between caster and target trajectory
    const solidInTrajectory = await this.battleRangedAttack.isSolidInRangedTrajectory(caster, target);
    if (solidInTrajectory) {
      return false;
    }

    return true;
  }

  private async executeEffect(caster: ICharacter, target: ICharacter | INPC | IItem, item: IItem): Promise<void> {
    if (item.canUseOnNonPVPZone !== true && target?.type === EntityType.Character) {
      const isUseValid = await this.battleCharacterAttackValidation.canAttack(caster, target as ICharacter);

      if (!isUseValid) {
        return;
      }
    }

    const blueprint = await blueprintManager.getBlueprint<any>("items", item.baseKey as AvailableBlueprints);

    const damage = await blueprint.usableEffect?.(caster, target, item);
    await target.save();

    // handle static item case
    await this.characterItemInventory.decrementItemFromInventoryByKey(item.key, caster, 1);

    void this.characterWeight.updateCharacterWeight(caster);

    await this.sendRefreshItemsEvent(caster);

    if (blueprint.projectileAnimationKey) {
      await this.sendAnimationEvents(caster, target, blueprint as IMagicItemUseWithEntity);
    }

    if (target.type === EntityType.Character || target.type === EntityType.NPC) {
      const transformedTarget = target as ICharacter | INPC;

      await this.sendTargetUpdateEvents(caster, transformedTarget);
      await this.onTargetHit.execute(transformedTarget, caster, damage);
      if (blueprint.usableEntityEffect) {
        await blueprint.usableEntityEffect(caster, transformedTarget);
      }
    }

    if (target.type === EntityType.Character) {
      await this.skillIncrease.increaseMagicResistanceSP(target as ICharacter, blueprint.power);

      await this.characterBonusPenalties.applyRaceBonusPenalties(target as ICharacter, BasicAttribute.MagicResistance);
    }
  }

  private async sendRefreshItemsEvent(character: ICharacter): Promise<void> {
    const container = (await this.characterItemContainer.getItemContainer(character)) as unknown as IItemContainer;

    const payloadUpdate: IEquipmentAndInventoryUpdatePayload = {
      inventory: container,
      openEquipmentSetOnUpdate: false,
      openInventoryOnUpdate: false,
    };

    this.socketMessaging.sendEventToUser<IEquipmentAndInventoryUpdatePayload>(
      character.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      payloadUpdate
    );
  }

  private async sendTargetUpdateEvents(character: ICharacter, target: ICharacter | INPC): Promise<void> {
    try {
      const classMapping = {
        NPC: NPC,
        Character: Character,
      };

      let nTarget = target;

      if (target.type in classMapping) {
        const Model = classMapping[target.type];
        const newTarget = await Model.findById(target.id);
        if (newTarget) {
          nTarget = newTarget;
        }
      }

      const { health, mana, speed } = nTarget;

      const payload: ICharacterAttributeChanged = {
        targetId: target._id,
        health,
        mana,
        speed,
      };

      await Promise.all([
        this.socketMessaging.sendEventToUser(character.channelId!, CharacterSocketEvents.AttributeChanged, payload),
        this.socketMessaging.sendEventToCharactersAroundCharacter(
          character,
          CharacterSocketEvents.AttributeChanged,
          payload
        ),
      ]);
    } catch (error) {
      console.error("Failed to send target update events: ", error);
      throw error;
    }
  }

  private async sendAnimationEvents(
    caster: ICharacter,
    target: ICharacter | INPC | IItem,
    item: IMagicItemUseWithEntity
  ): Promise<void> {
    await this.animationEffect.sendProjectileAnimationEventToCharacter(
      caster,
      caster._id,
      target._id,
      item.projectileAnimationKey,
      item.animationKey
    );
  }
}
