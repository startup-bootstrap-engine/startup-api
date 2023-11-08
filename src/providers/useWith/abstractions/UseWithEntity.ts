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
  IRuneItemBlueprint,
  IUseWithEntity,
  ItemSocketEvents,
  UseWithSocketEvents,
} from "@rpg-engine/shared";
import { EntityType } from "@rpg-engine/shared/dist/types/entity.types";
import { provide } from "inversify-binding-decorators";
import { IMagicItemUseWithEntity } from "../useWithTypes";
import { UseWithEntityValidation } from "./UseWithEntityValidation";

export type IUseWithItemSource = IRuneItemBlueprint & IMagicItemUseWithEntity;
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

    const blueprint = (await this.blueprintManager.getBlueprint("items", item?.baseKey!)) as IUseWithItemSource;

    const isBaseRequestValid = this.useWithEntityValidation.baseValidation(
      character,
      item!,
      blueprint,
      payload.entityType
    );

    if (!isBaseRequestValid) {
      return;
    }

    const isSelfTarget = blueprint.hasSelfAutoTarget;

    if (isSelfTarget) {
      await this.executeEffect(character, character, item!);

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
    // Ensure the item can be used in the current zone and context
    if (!(await this.canUseItemInZone(caster, item, target))) return;

    // Fetch blueprint before applying the effect as it's a dependency
    const blueprint = await this.fetchItemBlueprint(item);
    const damage = blueprint ? await this.applyUsableEffect(caster, target, item, blueprint) : 0;

    // Operations that can be parallelized because they are independent
    await Promise.all([
      // Save the state of the target
      target.save(),
      // Handle inventory count and character weight
      this.handleItemCountAndWeight(caster, item),
      // Send refresh items event to the caster
      this.sendRefreshItemsEvent(caster),
      // Send animation events if applicable based on the blueprint
      this.sendAnimationIfApplicable(caster, target, blueprint),
    ]);

    // Sequential operations due to potential data dependency
    await this.updateTargetState(caster, target, damage, blueprint);
    await this.applyCharacterSpecificEffects(target, blueprint);
  }

  // Additional refactored methods to break down the logic
  private async canUseItemInZone(caster: ICharacter, item: IItem, target: ICharacter | INPC | IItem): Promise<boolean> {
    if (item.canUseOnNonPVPZone !== true && target?.type === EntityType.Character) {
      return await this.battleCharacterAttackValidation.canAttack(caster, target as ICharacter);
    }
    return true;
  }

  private async fetchItemBlueprint(item: IItem): Promise<any> {
    return await blueprintManager.getBlueprint<any>("items", item.baseKey as AvailableBlueprints);
  }

  private async applyUsableEffect(
    caster: ICharacter,
    target: ICharacter | INPC | IItem,
    item: IItem,
    blueprint: any
  ): Promise<number> {
    return await blueprint.usableEffect?.(caster, target, item);
  }

  private async handleItemCountAndWeight(caster: ICharacter, item: IItem): Promise<void> {
    await this.characterItemInventory.decrementItemFromInventoryByKey(item.key, caster, 1);
    await this.characterWeight.updateCharacterWeight(caster);
  }

  private async sendAnimationIfApplicable(
    caster: ICharacter,
    target: ICharacter | INPC | IItem,
    blueprint: any
  ): Promise<void> {
    if (blueprint.projectileAnimationKey) {
      await this.sendAnimationEvents(caster, target, blueprint as IMagicItemUseWithEntity);
    }
  }

  private async updateTargetState(
    caster: ICharacter,
    target: ICharacter | INPC | IItem,
    damage: number,
    blueprint: any
  ): Promise<void> {
    if (target.type === EntityType.Character || target.type === EntityType.NPC) {
      const transformedTarget = target as ICharacter | INPC;
      await this.sendTargetUpdateEvents(caster, transformedTarget);
      await this.onTargetHit.execute(transformedTarget, caster, damage);
      if (blueprint.usableEntityEffect) {
        await blueprint.usableEntityEffect(caster, transformedTarget);
      }
    }
  }

  private async applyCharacterSpecificEffects(target: ICharacter | INPC | IItem, blueprint: any): Promise<void> {
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
