import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill } from "@entities/ModuleCharacter/SkillsModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { BattleAttackRanged } from "@providers/battle/BattleAttackTarget/BattleAttackRanged";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { SpecialEffect } from "@providers/entityEffects/SpecialEffect";
import { ItemValidation } from "@providers/item/validation/ItemValidation";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { EntityType, MagicsBlueprint, NPCAlignment } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { IMagicItemUseWithEntity } from "../useWithTypes";

const StaticEntity = "Item"; // <--- should be added to the EntityType enum from @rpg-engine/shared

@provide(UseWithEntityValidation)
export class UseWithEntityValidation {
  constructor(
    private battleRangedAttack: BattleAttackRanged,
    private specialEffect: SpecialEffect,
    private characterValidation: CharacterValidation,
    private movementHelper: MovementHelper,
    private itemValidation: ItemValidation,
    private socketMessaging: SocketMessaging
  ) {}

  public baseValidation(
    caster: ICharacter,
    item: IItem,
    blueprint: IMagicItemUseWithEntity,
    targetType: EntityType | typeof StaticEntity
  ): boolean {
    if (!item) {
      this.socketMessaging.sendErrorMessageToCharacter(caster, "Sorry, item you are trying to use was not found.");
      return false;
    }

    if (!blueprint || !(!!blueprint.power || targetType === StaticEntity) || !blueprint.usableEffect) {
      this.socketMessaging.sendErrorMessageToCharacter(caster, `Sorry, '${item.name}' cannot be used with target.`);
      return false;
    }

    if (!this.characterValidation.hasBasicValidation(caster)) {
      return false;
    }

    return true;
  }

  public async validateTargetRequest(
    caster: ICharacter,
    target: ICharacter | INPC | IItem | null,
    item: IItem | null,
    blueprint: IMagicItemUseWithEntity,
    targetType: EntityType | typeof StaticEntity
  ): Promise<boolean> {
    if (!target) {
      this.socketMessaging.sendErrorMessageToCharacter(caster, "Sorry, your target was not found.");
      return false;
    }

    if (caster.scene !== target.scene) {
      this.socketMessaging.sendErrorMessageToCharacter(caster, "Sorry, your target is not on the same scene.");
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

    if (!(await this.itemValidation.isItemInCharacterInventory(caster, item?._id))) {
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
}
