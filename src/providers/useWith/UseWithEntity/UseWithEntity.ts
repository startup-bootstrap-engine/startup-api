import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { BattleCharacterAttackValidation } from "@providers/battle/BattleCharacterAttack/BattleCharacterAttackValidation";
import { OnTargetHit } from "@providers/battle/OnTargetHit";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { CharacterBonusPenalties } from "@providers/character/characterBonusPenalties/CharacterBonusPenalties";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { CharacterItemInventory } from "@providers/character/characterItems/CharacterItemInventory";
import { CharacterWeight } from "@providers/character/weight/CharacterWeight";
import { EntityUtil } from "@providers/entityEffects/EntityUtil";
import { blueprintManager } from "@providers/inversify/container";
import { AvailableBlueprints } from "@providers/item/data/types/itemsBlueprintTypes";
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
  UseWithSocketEvents,
} from "@rpg-engine/shared";
import { EntityType } from "@rpg-engine/shared/dist/types/entity.types";
import { provide } from "inversify-binding-decorators";
import { IMagicItemUseWithEntity } from "../useWithTypes";
import { UseWithEntityValidation } from "./UseWithEntityValidation";

@provide(UseWithEntity)
export class UseWithEntity {
  constructor(
    private socketMessaging: SocketMessaging,

    private socketAuth: SocketAuth,
    private characterItemInventory: CharacterItemInventory,
    private characterWeight: CharacterWeight,
    private animationEffect: AnimationEffect,
    private characterItemContainer: CharacterItemContainer,
    private skillIncrease: SkillIncrease,
    private characterBonusPenalties: CharacterBonusPenalties,
    private onTargetHit: OnTargetHit,
    private battleCharacterAttackValidation: BattleCharacterAttackValidation,

    private blueprintManager: BlueprintManager,
    private useWithEntityValidation: UseWithEntityValidation
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

    if (!item) {
      throw new Error(`Item with id ${payload.itemId} not found!`);
    }

    const blueprint = (await this.blueprintManager.getBlueprint("items", item?.baseKey)) as IMagicItemUseWithEntity;

    const isBaseRequestValid = this.useWithEntityValidation.baseValidation(
      character,
      item,
      blueprint,
      payload.entityType
    );

    if (!isBaseRequestValid) {
      return;
    }

    const isTargetValid = await this.useWithEntityValidation.validateTargetRequest(
      character,
      target,
      item,
      blueprint,
      payload.entityType
    );
    if (!isTargetValid) {
      return;
    }

    await this.executeEffect(character, target!, item!);
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
