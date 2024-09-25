import { BadRequestError } from "@providers/errors/BadRequestError";
import { AuthMiddleware } from "@providers/middlewares/AuthMiddleware";
import { ILocalChatMessage } from "@rpg-engine/shared";
import { Response } from "express";
import { controller, httpGet, interfaces, queryParam } from "inversify-express-utils";
import { IAuthenticatedRequest } from "../../../../providers/types/ServerTypes";
import { ReadChatLogUseCase } from "./ReadChatLogUseCase";

@controller("/chat-log/zone")
export class ReadChatLogController implements interfaces.Controller {
  constructor(private readChatLogUseCase: ReadChatLogUseCase) {}

  @httpGet("/", AuthMiddleware)
  private async getChatLogInZone(
    @queryParam() chatLogZone,
    req: IAuthenticatedRequest,
    res: Response
  ): Promise<ILocalChatMessage[]> {
    const { x, y, scene } = chatLogZone;

    if (!x || !y || !scene) {
      throw new BadRequestError("Missing required parameters");
    }

    return await this.readChatLogUseCase.getChatLogInZone(chatLogZone);
  }
}
