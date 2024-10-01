import { ABTestRepository } from "@repositories/ModuleSystem/abTests/ABTestRepository";
import { provide } from "inversify-binding-decorators";

@provide(DeleteABTestUseCase)
export class DeleteABTestUseCase {
  constructor(private abTestsRepository: ABTestRepository) {}

  public async delete(id: string): Promise<boolean> {
    return await this.abTestsRepository.delete(id);
  }
}
