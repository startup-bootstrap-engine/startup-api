import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { AuthMiddleware } from "@providers/middlewares/AuthMiddleware";
import { controller, httpPost, interfaces, requestBody, response } from "inversify-express-utils";

@controller("/reject-request", AuthMiddleware)
export class RejectFriendRequestsController implements interfaces.Controller {
  constructor() {}

  @httpPost("/")
  @TrackNewRelicTransaction()
  private async rejectFriendRequests(@response() res, @requestBody() body): Promise<Array<ICharacter>> {
    // senderId is the one who sent the request
    // receiverId is the one who received the request aka me
    const { senderId, receiverId } = body;

    // eslint-disable-next-line mongoose-lean/require-lean
    const character = await Character.findById(senderId);
    // eslint-disable-next-line mongoose-lean/require-lean
    const myCharacter = await Character.findById(receiverId);

    if (!myCharacter || !character) {
      throw new BadRequestError("Character not found");
    }

    const friendRequestIndex = myCharacter.friendRequests?.indexOf(senderId);
    if (friendRequestIndex !== undefined && friendRequestIndex !== -1) {
      myCharacter.friendRequests?.splice(friendRequestIndex, 1);
    }

    // eslint-disable-next-line mongoose-lean/require-lean
    await myCharacter.save();

    // eslint-disable-next-line mongoose-lean/require-lean
    const friendRequests = await Character.find({ _id: { $in: myCharacter.friendRequests } });
    return res.status(200).send(friendRequests);
  }
}
