import { AuthMiddleware } from "@providers/middlewares/AuthMiddleware";
import { IAuthenticatedRequest } from "@providers/types/ServerTypes";
import { UserPreferenceRepository } from "@repositories/ModuleSystem/user/UserPreferenceRepository";
import { Response } from "express";
import { controller, httpDelete, httpGet, httpPatch, httpPost, request, response } from "inversify-express-utils";

@controller("/user/preferences", AuthMiddleware())
export class UserPreferenceController {
  constructor(private userPreferenceRepository: UserPreferenceRepository) {}

  @httpGet("/")
  public async getUserPreferences(@request() req: IAuthenticatedRequest, @response() res: Response): Promise<Response> {
    const userId = req.user.id;
    const preferences = await this.userPreferenceRepository.getUserPreferences(userId);
    return res.json(preferences);
  }

  @httpPost("/")
  public async createUserPreferences(
    @request() req: IAuthenticatedRequest,
    @response() res: Response
  ): Promise<Response> {
    const userId = req.user.id;

    const preferences = await this.userPreferenceRepository.createUserPreferences(userId, req.body);
    return res.status(201).json(preferences);
  }

  @httpPatch("/")
  public async updateUserPreferences(
    @request() req: IAuthenticatedRequest,
    @response() res: Response
  ): Promise<Response> {
    const userId = req.user.id;
    const preferences = await this.userPreferenceRepository.updateUserPreferences(userId, req.body);
    return res.json(preferences);
  }

  @httpDelete("/")
  public async deleteUserPreferences(
    @request() req: IAuthenticatedRequest,
    @response() res: Response
  ): Promise<Response> {
    const userId = req.user.id;
    await this.userPreferenceRepository.deleteUserPreferences(userId);
    return res.status(204).send();
  }
}
