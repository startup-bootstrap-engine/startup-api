import { IABTest } from "@entities/ModuleSystem/ABTestModel";
import { ABTestRepository } from "@repositories/ModuleSystem/abTests/ABTestRepository";
import { provide } from "inversify-binding-decorators";

import { NotFoundError } from "@providers/errors/NotFoundError";
import { UpdateABTestDTO } from "../ABTestDTO";

@provide(UpdateABTestUseCase)
export class UpdateABTestUseCase {
  constructor(private abTestsRepository: ABTestRepository) {}

  public async update(id: string, abTestUpdateDTO: UpdateABTestDTO): Promise<IABTest> {
    const result = await this.abTestsRepository.updateById(id, abTestUpdateDTO);

    if (!result) {
      throw new NotFoundError("ABTest not found");
    }

    return result;
  }
}
