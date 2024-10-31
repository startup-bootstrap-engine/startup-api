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
  response,
} from "inversify-express-utils";

import { RepositoryFactory } from "@providers/database/repository/RepositoryFactory";
import { DTOValidatorMiddleware } from "@providers/middlewares/DTOValidatorMiddleware";
import { ABRepository } from "@repositories/ModuleSystem/user/ABRepository";
import { HttpStatus, IABTest } from "@startup-engine/shared";
import { Response } from "express";
import { CreateABTestDTO, UpdateABTestDTO } from "./ABTestDTO";

@controller("/ab-tests")
export class ABTestController implements interfaces.Controller {
  constructor(
    private repositoryFactory: RepositoryFactory,
    private abRepository: ABRepository
  ) {}

  @httpPost("/", DTOValidatorMiddleware(CreateABTestDTO))
  private async create(
    @request() req,
    @response() res: Response,
    @requestBody() createABTestDTO: CreateABTestDTO
  ): Promise<Response> {
    const abTest = await this.abRepository.create(createABTestDTO as IABTest);
    return res.status(HttpStatus.OK).json(abTest);
  }

  @httpGet("/:id")
  private async read(@request() req, @response() res: Response, @requestParam("id") id: string): Promise<Response> {
    const abTest = await this.abRepository.findById(id);
    return res.status(HttpStatus.OK).json(abTest);
  }

  @httpGet("/")
  private async readAll(@request() req, @response() res: Response, @queryParam() query): Promise<Response> {
    const abTests = await this.abRepository.findAll(query);
    return res.status(HttpStatus.OK).json(abTests);
  }

  @httpPatch("/:id", DTOValidatorMiddleware(UpdateABTestDTO))
  private async update(
    @request() req,
    @response() res: Response,
    @requestParam("id") id: string,
    @requestBody() updateABTestDTO: UpdateABTestDTO
  ): Promise<Response> {
    const abTest = await this.abRepository.updateById(id, updateABTestDTO as IABTest);
    return res.status(HttpStatus.OK).json(abTest);
  }

  @httpDelete("/:id")
  private async delete(@request() req, @response() res: Response, @requestParam("id") id: string): Promise<Response> {
    const result = await this.abRepository.delete(id);
    return res.status(HttpStatus.OK).json(result);
  }
}
