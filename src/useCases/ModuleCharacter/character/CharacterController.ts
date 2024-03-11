import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { AuthMiddleware } from "@providers/middlewares/AuthMiddleware";
import { DTOValidatorMiddleware } from "@providers/middlewares/DTOValidatorMiddleware";
import { IAuthenticatedRequest } from "@providers/types/ServerTypes";
import rateLimit from "express-rate-limit";
import {
  controller,
  httpDelete,
  httpGet,
  httpPatch,
  httpPost,
  interfaces,
  queryParam,
  request,
  requestBody,
  requestParam,
} from "inversify-express-utils";
import { CreateCharacterDTO } from "./create/CreateCharacterDTO";
import { CreateCharacterUseCase } from "./create/CreateCharacterUseCase";
import { DeleteCharacterUseCase } from "./delete/DeleteCharacterUseCase";
import { ReadCharacterUseCase } from "./read/ReadCharacterUseCase";
import { UpdateCharacterDTO } from "./update/UpdateCharacterDTO";
import { UpdateCharacterUseCase } from "./update/UpdateCharacterUseCase";

const characterDefaultRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // limit each IP to 25 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

const characterReadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

@controller("/characters", AuthMiddleware)
export class CharacterController implements interfaces.Controller {
  constructor(
    private createCharacterUseCase: CreateCharacterUseCase,
    private readCharacterUseCase: ReadCharacterUseCase,
    private updateCharacterUseCase: UpdateCharacterUseCase,
    private deleteCharacterUseCase: DeleteCharacterUseCase
  ) {}

  @httpPost("/", DTOValidatorMiddleware(CreateCharacterDTO), characterDefaultRateLimiter)
  private async createCharacter(
    @requestBody() newCharacter: CreateCharacterDTO,
    @request() request: IAuthenticatedRequest
  ): Promise<ICharacter> {
    const ownerId = request.user.id;

    return await this.createCharacterUseCase.create(newCharacter, ownerId);
  }

  @httpGet("/", characterReadRateLimiter)
  private async readAllCharacters(@request() req): Promise<ICharacter[]> {
    const ownerId = req.user.id;

    return await this.readCharacterUseCase.readAll(ownerId);
  }

  @httpGet("/:id", characterReadRateLimiter)
  private async readCharacter(
    @request() req,
    @requestParam("id") id: string,
    @queryParam("fields") fields?: string
  ): Promise<ICharacter> {
    const fieldsArray = fields?.split(",") ?? [];

    return await this.readCharacterUseCase.read(id, fieldsArray);
  }

  @httpPatch("/:id", DTOValidatorMiddleware(UpdateCharacterDTO), characterDefaultRateLimiter)
  private async updateCharacter(
    @requestParam("id") id: string,
    @requestBody() updateCharacter: UpdateCharacterDTO,
    @request() request: IAuthenticatedRequest
  ): Promise<ICharacter> {
    const ownerId = request.user.id;

    return await this.updateCharacterUseCase.updateCharacter(id, updateCharacter, ownerId);
  }

  @httpDelete("/:id", characterDefaultRateLimiter)
  private async deleteCharacter(
    @requestParam("id") id: string,
    @request() request: IAuthenticatedRequest
  ): Promise<boolean> {
    const ownerId = request.user.id;

    return await this.deleteCharacterUseCase.delete(id, ownerId);
  }
}
