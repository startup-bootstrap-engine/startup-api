import { ABTest, IABTest } from "@entities/ModuleSystem/ABTestModel";
import { BaseRepository } from "@providers/database/repository/BaseRepository";
import { RepositoryFactory } from "@providers/database/repository/RepositoryFactory";
import { provide } from "inversify-binding-decorators";

@provide(ABTestRepository)
export class ABTestRepository extends BaseRepository<IABTest> {
  constructor(private repositoryFactory: RepositoryFactory) {
    super(repositoryFactory.createRepository<IABTest>(ABTest));
  }
}
