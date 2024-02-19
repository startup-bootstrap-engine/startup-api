import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { provide } from "inversify-binding-decorators";

@provide(SocketAuthEventsViolation)
export class SocketAuthEventsViolation {
  private violationQtyThreshold = 5;

  constructor(private inMemoryHashTable: InMemoryHashTable) {}

  public async addViolation(character: ICharacter): Promise<void> {
    const todayViolations = new Date().toDateString();

    const violationsByDate = await this.getViolationsByDate(todayViolations);

    // Increment violation count for the character
    violationsByDate[character._id] = (violationsByDate[character._id] || 0) + 1;

    // Update the violations for the current date in the InMemoryHashTable
    await this.inMemoryHashTable.set("socket-auth-events-violation", todayViolations, violationsByDate);
  }

  public async isViolationHigherThanThreshold(character: ICharacter): Promise<boolean> {
    const todayViolations = new Date().toDateString(); // Get current date as string

    // Retrieve the current date's violations
    const violationsByDate = await this.getViolationsByDate(todayViolations);

    // Get the violation count for the character
    const violationCount = violationsByDate[character._id] || 0;

    // Check if the violation count is higher than the threshold
    return violationCount > this.violationQtyThreshold;
  }

  public async resetCharacterViolations(character: ICharacter): Promise<void> {
    const todayViolations = new Date().toDateString(); // Get current date as string

    // Retrieve the current date's violations
    const violationsByDate = await this.getViolationsByDate(todayViolations);

    // Reset the violation count for the character
    delete violationsByDate[character._id];

    // Update the violations for the current date in the InMemoryHashTable
    await this.inMemoryHashTable.set("socket-auth-events-violation", todayViolations, violationsByDate);
  }

  public async clear(): Promise<void> {
    await this.inMemoryHashTable.deleteAll("socket-auth-events-violation");
  }

  private async getViolationsByDate(date: string): Promise<Record<string, number>> {
    return (await this.inMemoryHashTable.get("socket-auth-events-violation", date)) || {};
  }
}
