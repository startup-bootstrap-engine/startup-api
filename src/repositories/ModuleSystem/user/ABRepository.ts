import { ABTestModel } from "@entities/ModuleSystem/ABTestModel";
import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { BaseRepository, IBaseRepository } from "@providers/database/repository/BaseRepository";
import { repositoryFactory } from "@providers/inversify/container";
import { abTestSchema, IABTest } from "@startup-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(ABRepository)
export class ABRepository extends BaseRepository<IABTest> implements IBaseRepository<IABTest> {
  constructor(private analyticsHelper: AnalyticsHelper, private abTestModel: ABTestModel) {
    // Initialize the base repository after ensuring userSchema is available
    super(repositoryFactory.createRepository<IABTest>(abTestModel.initializeData(abTestSchema), abTestSchema));
  }
}
