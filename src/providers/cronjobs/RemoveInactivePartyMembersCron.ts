import PartyManagement from "@providers/party/PartyManagement";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(RemoveInactivePartyMembersCron)
export class RemoveInactivePartyMembersCron {
  constructor(private partyManagement: PartyManagement, private cronJobSchedules: CronJobScheduler) {}

  public schedule(): void {
    //!  Disabled because it causes more issues than solve it
    // this.cronJobSchedules.uniqueSchedule("remove-inactive-party-members", "*/1 * * * *", async () => {
    //   const parties = await CharacterParty.find().lean();
    //   for (const party of parties) {
    //     const partyId = party._id;
    //     await this.partyManagement.removeInactivePartyMembers(partyId);
    //   }
    // });
  }
}
