import { IABTest } from "@entities/ModuleSystem/ABTestModel";
import { NotFoundError } from "@providers/errors/NotFoundError";
import { ABTestRepository } from "@repositories/ModuleSystem/abTests/ABTestRepository";
import { provide } from "inversify-binding-decorators";

@provide(ReadABTestUseCase)
export class ReadABTestUseCase {
  constructor(private abTestsRepository: ABTestRepository) {}

  public async read(id: string): Promise<IABTest | null> {
    const result = await this.abTestsRepository.findById(id);

    if (!result) {
      throw new NotFoundError("ABTest not found");
    }

    return result;
  }

  public async readAll(query): Promise<IABTest[]> {
    return await this.abTestsRepository.findAll(query);
  }
}
