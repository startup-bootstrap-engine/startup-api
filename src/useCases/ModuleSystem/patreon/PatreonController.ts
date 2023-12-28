import { PatreonAPI } from "@providers/patreon/PatreonAPI";
import { PatreonStatus } from "@providers/patreon/PatreonTypes";
import { UserAccountTypes } from "@rpg-engine/shared";
import { controller, httpGet, interfaces, queryParam, requestParam, response } from "inversify-express-utils";

@controller("/patreon")
export class PatreonController implements interfaces.Controller {
  constructor(private patreonAPI: PatreonAPI) {}

  @httpGet("/authenticate")
  public patreonAuthenticate(@response() res): Promise<void> {
    const url = this.patreonAPI.generateAuthorizationURL();

    return res.status(200).send({
      message: "Patreon authentication URL generated successfully!",
      url: url,
    });
  }

  @httpGet("/campaigns")
  public async listCampaigns(@response() res): Promise<void> {
    const campaigns = await this.patreonAPI.fetchCampaigns();

    return res.status(200).send({
      campaigns: campaigns,
    });
  }

  @httpGet("/campaigns/:campaignId/memberships")
  public async listCampaignMembers(
    @response() res,
    @requestParam("campaignId") campaignId: string,
    @queryParam("status") status: PatreonStatus,
    @queryParam("tier") tier: string
  ): Promise<void> {
    if (!campaignId) {
      return res.status(400).send({
        message: "Missing campaignId",
      });
    }

    const members = await this.patreonAPI.getCampaignMemberships(campaignId, status, tier as UserAccountTypes);

    return res.status(200).send({
      members: members,
    });
  }

  @httpGet("/callback")
  public async patreonCallback(@response() res, @queryParam("code") code: string): Promise<void> {
    // validate receipt of oauth token

    const result = await this.patreonAPI.validateReceiptOfOauthToken(code);

    return res.status(200).send({
      message: "Patreon callback received successfully! Please copy this info to your .env file",
      ...result,
    });
  }
}
