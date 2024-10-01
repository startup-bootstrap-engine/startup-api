import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { CRUD } from "@providers/database/generics/MongoCRUDGeneric";
import { provide } from "inversify-binding-decorators";

@provide(ABTestRepository)
export class ABTestRepository extends CRUD {
  constructor(private analyticsHelper: AnalyticsHelper) {
    super(analyticsHelper);
  }
}
