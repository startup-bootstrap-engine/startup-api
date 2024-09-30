import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { provide } from "inversify-binding-decorators";

@provide(PremiumAccountUseCase)
export class PremiumAccountUseCase {
  constructor(private inMemoryHashTable: InMemoryHashTable) {}
}
