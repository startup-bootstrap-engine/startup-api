import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { CharacterSkull } from "@providers/character/CharacterSkull";
import { PVP_MIN_REQUIRED_LV } from "@providers/constants/PVPConstants";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { CharacterSkullType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(CharacterPlantActions)
export class CharacterPlantActions {
  constructor(private socketMessaging: SocketMessaging, private characterSkull: CharacterSkull) {}

  public async canPerformActionOnUnowedPlant(
    character: ICharacter,
    targetPlant: IItem,
    errorMessageToPlantOwner: string
  ): Promise<boolean> {
    const skills = await Skill.findOne({ character: character._id })
      .lean()
      .cacheQuery({
        cacheKey: `${character._id}-skills`,
      });

    if (!skills || skills.level <= PVP_MIN_REQUIRED_LV) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        `You need to be at least lv ${PVP_MIN_REQUIRED_LV} to perform this action.`
      );
      return false;
    }

    const plantOwner = (await Character.findOne({ _id: targetPlant.owner }).lean()) as ICharacter;

    if (plantOwner) {
      this.socketMessaging.sendErrorMessageToCharacter(plantOwner, errorMessageToPlantOwner);
    }

    if (
      !character.hasSkull &&
      character.skullType !== CharacterSkullType.YellowSkull &&
      character.skullType !== CharacterSkullType.RedSkull
    ) {
      await this.characterSkull.setSkull(character, CharacterSkullType.WhiteSkull);
    }

    return true;
  }
}
