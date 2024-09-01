import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { itemCraftable } from "@providers/inversify/container";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  IUseWithItemToEntityOptions,
  IUseWithItemToEntityReward,
  UseWithItemToEntity,
} from "@providers/useWith/abstractions/UseWithItemToEntity";
import { CraftingSkill, EntityType, ItemRarities, NPCSubtype } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { CraftingResourcesBlueprint, FoodsBlueprint } from "./data/types/itemsBlueprintTypes";

@provide(CarveMeatFromBody)
export class CarveMeatFromBody {
  constructor(private useWithItemToEntity: UseWithItemToEntity, private socketMessaging: SocketMessaging) {}

  public async execute(character: ICharacter, targetItem: IItem, originItem: IItem): Promise<void> {
    const rarityOfTool = originItem?.rarity ?? ItemRarities.Common;

    if (!targetItem.deadBodyEntityType || targetItem.deadBodyEntityType !== EntityType.NPC) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you can't butcher this.");
      return;
    }

    if (targetItem.hasButchered) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, this body has already been butchered.");
      return;
    }

    const targetEntity = await NPC.findOne({ _id: targetItem.bodyFromId }).lean<INPC>();

    if (!targetEntity) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you can't butcher this.");
      return;
    }

    const baseUseWithTileToEntityOptions: IUseWithItemToEntityOptions = {
      targetEntity,
      errorMessages: [
        "Hmm... Nothing here.",
        "Your effort is in vain.",
        "Hmm... You didn't find anything.",
        "You tried, but you found nothing this time.",
        "Butchering is hard work! Nothing here!",
      ],
      successMessages: [
        "You found some meat!",
        "Wow! You got some meat!",
        "You found some meat! You can cook it for lunch.",
      ],
      rewards: [],
    };

    const useWithItemToEntityOptions: IUseWithItemToEntityOptions = await this.getRewardsBasedOnEntityType(
      targetEntity,
      baseUseWithTileToEntityOptions,
      character,
      rarityOfTool as ItemRarities
    );

    if (useWithItemToEntityOptions.rewards.length < 1) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you can't butcher this.");
      return;
    }

    await this.useWithItemToEntity.execute(character, useWithItemToEntityOptions);

    await Item.updateOne({ _id: targetItem._id }, { $set: { hasButchered: true } });
  }

  private async getRewardsBasedOnEntityType(
    targetEntity: INPC,
    baseOptions: IUseWithItemToEntityOptions,
    character: ICharacter,
    rarityOfTool: ItemRarities
  ): Promise<IUseWithItemToEntityOptions> {
    const rewards: IUseWithItemToEntityReward[] = [];

    switch (targetEntity.subType) {
      case NPCSubtype.Animal:
        rewards.push(
          await this.createReward(character, rarityOfTool, FoodsBlueprint.RedMeat, [1, 3], 30),
          await this.createReward(character, rarityOfTool, CraftingResourcesBlueprint.Leather, [1, 2], 15),
          await this.createReward(character, rarityOfTool, CraftingResourcesBlueprint.Bones, [1, 3], 20),
          await this.createReward(character, rarityOfTool, CraftingResourcesBlueprint.Eye, [1, 1], 10)
        );
        break;
      case NPCSubtype.Bird:
        rewards.push(
          await this.createReward(character, rarityOfTool, FoodsBlueprint.ChickensMeat, [1, 3], 30),
          await this.createReward(character, rarityOfTool, CraftingResourcesBlueprint.Feather, [2, 5], 25)
        );
        break;
      case NPCSubtype.Insect:
        rewards.push(
          await this.createReward(character, rarityOfTool, CraftingResourcesBlueprint.SewingThread, [1, 2], 20),
          await this.createReward(character, rarityOfTool, CraftingResourcesBlueprint.Silk, [1, 3], 15)
        );
        break;
      case NPCSubtype.Undead:
        rewards.push(
          await this.createReward(character, rarityOfTool, CraftingResourcesBlueprint.Bones, [2, 4], 30),
          await this.createReward(character, rarityOfTool, CraftingResourcesBlueprint.Skull, [1, 1], 10),
          await this.createReward(character, rarityOfTool, CraftingResourcesBlueprint.Eye, [1, 1], 10)
        );
        break;
      case NPCSubtype.Magical:
        rewards.push(
          await this.createReward(character, rarityOfTool, CraftingResourcesBlueprint.MedicinalLeaf, [1, 2], 10),
          await this.createReward(character, rarityOfTool, CraftingResourcesBlueprint.Herb, [1, 3], 15)
        );
        break;
      case NPCSubtype.Humanoid:
        rewards.push(
          await this.createReward(character, rarityOfTool, FoodsBlueprint.RawBeefSteak, [1, 2], 25),
          await this.createReward(character, rarityOfTool, CraftingResourcesBlueprint.Bones, [1, 3], 20)
        );
        break;
      case NPCSubtype.Dragon:
        rewards.push(
          await this.createReward(character, rarityOfTool, CraftingResourcesBlueprint.DragonHead, [1, 1], 5),
          await this.createReward(character, rarityOfTool, CraftingResourcesBlueprint.DragonTooth, [1, 2], 15)
        );
        break;
      case NPCSubtype.Elemental:
        rewards.push(
          await this.createReward(character, rarityOfTool, CraftingResourcesBlueprint.BlueSilk, [1, 1], 5),
          await this.createReward(character, rarityOfTool, CraftingResourcesBlueprint.ColoredFeather, [1, 2], 15)
        );
        break;
      default:
        break;
    }

    return {
      ...baseOptions,
      rewards: [...baseOptions.rewards, ...rewards],
    };
  }

  private async createReward(
    character: ICharacter,
    rarityOfTool: ItemRarities,
    key: FoodsBlueprint | CraftingResourcesBlueprint,
    qty: [number, number],
    difficulty: number
  ): Promise<IUseWithItemToEntityReward> {
    return {
      chance: await itemCraftable.getCraftChance(character, CraftingSkill.Cooking, difficulty, rarityOfTool),
      key,
      qty,
    };
  }
}
