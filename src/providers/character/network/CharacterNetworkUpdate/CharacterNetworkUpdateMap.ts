import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { NPC } from "@entities/ModuleNPC/NPCModel";
import { CharacterUser } from "@providers/character/CharacterUser";
import { MapNonPVPZone } from "@providers/map/MapNonPVPZone";
import { MapTransitionInfo } from "@providers/map/MapTransition/MapTransitionInfo";
import { MapTransitionTeleport } from "@providers/map/MapTransition/MapTransitionTeleport";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { NPCAlignment } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { capitalize } from "lodash";

@provide(CharacterNetworkUpdateMapManager)
export class CharacterNetworkUpdateMapManager {
  constructor(
    private mapTransitionInfo: MapTransitionInfo,
    private mapTransitionTeleport: MapTransitionTeleport,
    private mapNonPVPZone: MapNonPVPZone,
    private socketMessaging: SocketMessaging,
    private characterUser: CharacterUser
  ) {}

  public async handleNonPVPZone(character: ICharacter, newX: number, newY: number): Promise<void> {
    if (!character.target?.id) {
      return;
    }

    if (String(character.target.type) === "NPC") {
      const npc = await NPC.findById(character.target.id).lean();

      if (npc?.alignment !== NPCAlignment.Friendly) {
        return;
      }
    }

    /* 
          Verify if we're in a non pvp zone. If so, we need to trigger 
          an attack stop event in case player was in a pvp combat
          */
    const nonPVPZone = this.mapNonPVPZone.isNonPVPZoneAtXY(character.scene, newX, newY);
    if (nonPVPZone) {
      this.mapNonPVPZone.stopCharacterAttack(character);
    }
  }

  public async handleMapTransition(character: ICharacter, newX: number, newY: number): Promise<void> {
    const frozenCharacter = Object.freeze(character);

    // verify if we're in a map transition. If so, we need to trigger a scene transition
    const transition = this.mapTransitionInfo.getTransitionAtXY(frozenCharacter.scene, newX, newY);
    if (transition) {
      const map = this.mapTransitionInfo.getTransitionProperty(transition, "map");
      const gridX = Number(this.mapTransitionInfo.getTransitionProperty(transition, "gridX"));
      const gridY = Number(this.mapTransitionInfo.getTransitionProperty(transition, "gridY"));
      const allowOnlyPremiumAccountType = this.mapTransitionInfo.getTransitionProperty(transition, "accountType");

      if (!map || !gridX || !gridY) {
        console.error("Failed to fetch required destination properties.");
        return;
      }

      const destination = {
        map,
        gridX,
        gridY,
      };

      if (allowOnlyPremiumAccountType) {
        const allowedTypes = allowOnlyPremiumAccountType.split(",").map((type) => type.trim());

        // Finding user by character and setting default account type if not found
        const user = await this.characterUser.findUserByCharacter(character);
        const userAccountType = user?.accountType || "free";

        // Check if user's account type is in the list of allowed typesA
        if (!allowedTypes.includes(userAccountType)) {
          this.socketMessaging.sendErrorMessageToCharacter(
            character,
            `Sorry, a premium account of type '${allowedTypes
              .map((x) => `${capitalize(x)}`)
              .join(", ")}' is required to access this area.`
          );
          return;
        }
      }

      /*
   Check if we are transitioning to the same map, 
   if so we should only teleport the character
   */

      if (destination.map === frozenCharacter.scene) {
        await this.mapTransitionTeleport.sameMapTeleport(frozenCharacter, destination);
      } else {
        await this.mapTransitionTeleport.changeCharacterScene(frozenCharacter, destination);
      }
    }
  }
}
