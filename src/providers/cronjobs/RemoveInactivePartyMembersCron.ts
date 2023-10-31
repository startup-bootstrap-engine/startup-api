import PartyManagement from "@providers/party/PartyManagement";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";
import { CharacterParty } from "@entities/ModuleCharacter/CharacterPartyModel";

@provide(RemoveInactivePartyMembersCron)
export class RemoveInactivePartyMembersCron {
  constructor(private partyManagement: PartyManagement, private cronJobSchedules: CronJobScheduler) {}

  public schedule(): void {
    this.cronJobSchedules.uniqueSchedule("remove-inactive-party-members", "*/1 * * * *", async () => {
      const parties = await CharacterParty.find().lean();

      for (const party of parties) {
        const partyId = party._id;

        await this.partyManagement.removeInactivePartyMembers(partyId);
      }
    });
  }
}
