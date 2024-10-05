import { ABTest, IABTest } from "@entities/ModuleSystem/ABTestModel";
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

import { GenericUseCase } from "@providers/database/generics/GenericUseCase";
import { BaseRepository } from "@providers/database/repository/BaseRepository";
import { RepositoryFactory } from "@providers/database/repository/RepositoryFactory";
import { CreateABTestDTO, UpdateABTestDTO } from "./ABTestDTO";

@controller("/ab-tests")
export class ABTestController implements interfaces.Controller {
  private ABTestUseCase: GenericUseCase<IABTest>;

  constructor(private repositoryFactory: RepositoryFactory) {
    this.ABTestUseCase = new GenericUseCase(
      ABTest,
      repositoryFactory.createRepository<IABTest>(ABTest) as BaseRepository<IABTest>
    );
  }

  @httpPost("/")
  private async create(
    @request() req,
    @response() res,
    @requestBody() createABTestDTO: CreateABTestDTO
  ): Promise<IABTest> {
    return await this.ABTestUseCase.create(createABTestDTO as IABTest);
  }

  @httpGet("/:id")
  private async read(@request() req, @response() res, @requestParam("id") id: string): Promise<IABTest | null> {
    return await this.ABTestUseCase.findById(id);
  }

  @httpGet("/")
  private async readAll(@request() req, @response() res, @queryParam() query): Promise<IABTest[]> {
    return await this.ABTestUseCase.findAll(query);
  }

  @httpPatch("/:id")
  private async update(
    @request() req,
    @response() res,
    @requestParam("id") id: string,
    @requestBody() updateABTestDTO: UpdateABTestDTO
  ): Promise<IABTest | null> {
    return await this.ABTestUseCase.updateById(id, updateABTestDTO as IABTest);
  }

  @httpDelete("/:id")
  private async delete(@request() req, @response() res, @requestParam("id") id: string): Promise<boolean> {
    return await this.ABTestUseCase.delete(id);
  }
}
