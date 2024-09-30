import { provide } from "inversify-binding-decorators";

@provide(Seeder)
export class Seeder {
  constructor() {}

  public start(): void {
    console.time("🌱 Total Seeding");
  }
}
