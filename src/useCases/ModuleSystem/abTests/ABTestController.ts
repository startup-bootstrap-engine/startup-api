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
import { ABRepository } from "@repositories/ModuleSystem/user/ABRepository";
import { IABTest } from "@startup-engine/shared";
import { CreateABTestDTO, UpdateABTestDTO } from "./ABTestDTO";

@controller("/ab-tests")
export class ABTestController implements interfaces.Controller {
  constructor(private repositoryFactory: RepositoryFactory, private abRepository: ABRepository) {}

  @httpPost("/")
  private async create(
    @request() req,
    @response() res,
    @requestBody() createABTestDTO: CreateABTestDTO
  ): Promise<IABTest> {
    return await this.abRepository.create(createABTestDTO as IABTest);
  }

  @httpGet("/:id")
  private async read(@request() req, @response() res, @requestParam("id") id: string): Promise<IABTest | null> {
    return await this.abRepository.findById(id);
  }

  @httpGet("/")
  private async readAll(@request() req, @response() res, @queryParam() query): Promise<IABTest[]> {
    return await this.abRepository.findAll(query);
  }

  @httpPatch("/:id")
  private async update(
    @request() req,
    @response() res,
    @requestParam("id") id: string,
    @requestBody() updateABTestDTO: UpdateABTestDTO
  ): Promise<IABTest | null> {
    return await this.abRepository.updateById(id, updateABTestDTO as IABTest);
  }

  @httpDelete("/:id")
  private async delete(@request() req, @response() res, @requestParam("id") id: string): Promise<boolean> {
    return await this.abRepository.delete(id);
  }
}
