import { container } from "@providers/inversify/container";
import { FactionRepository } from "../FactionRepository";

describe("FactionRepository.ts", () => {
  let factionRepository: FactionRepository;

  beforeAll(() => {
    factionRepository = container.get<FactionRepository>(FactionRepository);
  });

  it("should read correct sprites from json", () => {
    const result = factionRepository.readSprites("Warrior", "Dwarf");
    expect(result.length).toEqual(20);
  });

  it("should check if sprite exists", () => {
    const result = factionRepository.exists("Dwarf", "dwarf-guard");
    expect(result).toEqual(true);
  });
});
