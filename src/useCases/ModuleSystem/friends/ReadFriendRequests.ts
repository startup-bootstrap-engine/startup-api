import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { AuthMiddleware } from "@providers/middlewares/AuthMiddleware";
import { controller, httpPost, interfaces, requestBody, response } from "inversify-express-utils";

@controller("/friend-requests", AuthMiddleware)
export class ReadFriendRequestsController implements interfaces.Controller {
  constructor() {}
  @httpPost("/")
  @TrackNewRelicTransaction()
  private async getFriendRequests(@response() res, @requestBody() body): Promise<Array<ICharacter>> {
    // characterId is owner character
    const { characterId } = body;

    const character = (await Character.findOne({ _id: characterId }).lean()) as ICharacter;

    if (!character) {
      throw new BadRequestError("Character not found");
    }
    const friendRequestIds = character.friendRequests;
    if (!friendRequestIds) {
      return [];
    }

    // eslint-disable-next-line mongoose-lean/require-lean
    const friendRequests = await Character.find({ _id: { $in: friendRequestIds } });

    return res.status(200).send(friendRequests);
  }
}
