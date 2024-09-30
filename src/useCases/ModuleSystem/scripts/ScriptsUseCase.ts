import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";

import { provide } from "inversify-binding-decorators";

@provide(ScriptsUseCase)
export class ScriptsUseCase {
  constructor(private inMemoryHashTable: InMemoryHashTable) {}
}
