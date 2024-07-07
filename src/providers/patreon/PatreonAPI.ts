import { appEnv } from "@providers/config/env";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { EnvType, UserAccountTypes } from "@rpg-engine/shared";
import axios from "axios";
import qs from "qs";
import { ICampaignMembersResponse, ICampaignsResponse, IPatreonMemberData, PatreonStatus } from "./PatreonTypes";

type PatreonTierMapping = {
  [key in UserAccountTypes]: string;
};

const patreonTierMapping: PatreonTierMapping = {
  [UserAccountTypes.Free]: "Free",
  [UserAccountTypes.PremiumBronze]: "Bronze Tier",
  [UserAccountTypes.PremiumSilver]: "Silver Tier",
  [UserAccountTypes.PremiumGold]: "Gold Tier",
  [UserAccountTypes.PremiumUltimate]: "Ultimate Tier",
};
@provideSingleton(PatreonAPI)
export class PatreonAPI {
  private accessToken: string;
  private clientId: string = appEnv.patreon.clientId!;
  private clientSecret: string = appEnv.patreon.clientSecret!;
  private redirectURI: string = appEnv.patreon.redirectURI!;
  private refreshToken: string;
  private campaignId: string = appEnv.patreon.campaignId!;
  private accessTokenExpiration: Date | null = null;

  private scopes = ["identity", "identity[email]", "identity.memberships", "campaigns.members[email]"];

  constructor() {}

  public initialize(): void {
    try {
      if (appEnv.general.ENV === EnvType.Development) {
        return;
      }

      if (!this.clientId || !this.clientSecret || !this.redirectURI || !this.campaignId) {
        throw new Error(`Failed to authenticate with Patreon API.
          Some of these credentials are missing:
          clientId: ${this.clientId}
          clientSecret: ${this.clientSecret}
          redirectURI: ${this.redirectURI}
          campaignId: ${this.campaignId}
        `);
      }

      this.accessToken = appEnv.patreon.accessToken!;
      this.refreshToken = appEnv.patreon.refreshToken!;
      const expiresIn = appEnv.patreon.accessTokenExpiration!;

      if (!this.accessToken || !this.refreshToken || !expiresIn) {
        throw new Error(`Failed to authenticate with Patreon API.
          Some of these credentials are missing:
          accessToken: ${this.accessToken}
          refreshToken: ${this.refreshToken}
          accessTokenExpiration: ${expiresIn}
        `);
      }

      this.accessTokenExpiration = new Date(Date.now() + expiresIn * 1000);
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  }

  public generateAuthorizationURL(): string {
    if (!this.clientId || !this.redirectURI) {
      throw new Error("Failed to generate authorization URL: Missing credentials");
    }

    // scope here should allow fe
    const url = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${
      this.clientId
    }&redirect_uri=${encodeURIComponent(this.redirectURI)}&scope=${encodeURIComponent(this.scopes.join(" "))}  
    `;

    console.log("PatreonAPI: Generated authorization URL:", url);

    return url;
  }

  public async refreshAccessToken(): Promise<void> {
    try {
      const response = await axios.post("https://www.patreon.com/api/oauth2/token", {
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      });

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token; // Update refresh token

      // Update the access token expiration time
      const expiresIn = response.data.expires_in; // replace with actual field name
      this.accessTokenExpiration = new Date(Date.now() + expiresIn * 1000);
    } catch (error) {
      console.error("Failed to refresh access token:", error);
      throw new Error("Failed to refresh access token with Patreon API");
    }
  }

  public async isSubscriberActive(email: string): Promise<boolean> {
    // fetch all members from campaign
    const response = await this.getCampaignMemberships(this.campaignId);

    if (!response) {
      throw new Error("Failed to fetch campaign memberships");
    }

    const members = response.data;

    for (const member of members) {
      if (member.attributes.email === email) {
        return member.attributes.patron_status === "active_patron";
      }
    }

    // If the email is not found in the members list, return false
    return false;
  }

  public async getPatreons(
    status: PatreonStatus,
    accountTypes: UserAccountTypes | "all"
  ): Promise<IPatreonMemberData[] | undefined> {
    try {
      const response = await this.getCampaignMemberships(this.campaignId, status, accountTypes);

      if (!response) {
        throw new Error("Failed to fetch campaign memberships");
      }

      const members = response.data;

      // Filter the members to only include active patrons
      const activePatrons = members.filter((member) => member.attributes.patron_status === "active_patron");

      return activePatrons;
    } catch (error) {
      console.error(error);
    }
  }

  public async validateReceiptOfOauthToken(
    code: string
  ): Promise<{ access_token: string; refresh_token: string; expires_in: number } | undefined> {
    try {
      const data = qs.stringify({
        grant_type: "authorization_code",
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectURI,
      });

      const response = await axios.post("https://www.patreon.com/api/oauth2/token", data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const { access_token, refresh_token, expires_in } = response.data;

      return { access_token, refresh_token, expires_in };
    } catch (error) {
      console.error(error);
    }
  }

  public async fetchCampaigns(): Promise<ICampaignsResponse | undefined> {
    try {
      const response = await this.makeRequest("get", "https://www.patreon.com/api/oauth2/v2/campaigns");
      return response?.data;
    } catch (error) {
      console.error(error);
    }
  }

  public async getCampaignMemberships(
    campaignId: string,
    patreon_status: PatreonStatus = "all",
    accountType: UserAccountTypes | "all" = "all"
  ): Promise<ICampaignMembersResponse | undefined> {
    try {
      if (!campaignId) {
        throw new Error("Missing campaignId");
      }

      const fields = encodeURIComponent("fields[member]") + "=email,full_name,patron_status";
      const include = encodeURIComponent("include") + "=currently_entitled_tiers";
      const tierFields = encodeURIComponent("fields[tier]") + "=title,description,amount_cents";
      let nextPage: string | null = null;
      let allMembers: IPatreonMemberData[] = [];
      const allTiers: any[] = [];

      do {
        const response = await this.makeRequest(
          "get",
          nextPage ||
            `https://www.patreon.com/api/oauth2/v2/campaigns/${campaignId}/members?${fields}&${include}&${tierFields}`
        );

        if (response?.data) {
          const { data: members, included: tiers } = response.data;
          allMembers.push(...members);
          allTiers.push(...tiers);
          nextPage = response?.links?.next || null;
        }
      } while (nextPage);

      allMembers = this.addTierNamesToMembers(allMembers, allTiers);

      if (patreon_status !== "all") {
        allMembers = allMembers.filter((member) => member.attributes.patron_status === patreon_status);
      }

      if (accountType !== "all") {
        allMembers = allMembers.filter((member) =>
          member.attributes.tier_name ? member.attributes.tier_name === accountType : false
        );
      }

      return { data: allMembers };
    } catch (error) {
      if (error.response) {
        console.error(error.response.data);
      } else if (error.request) {
        console.error(error.request);
      } else {
        console.error("Error", error.message);
      }
    }
  }

  private addTierNamesToMembers(members: any[], tiers: any[]): any[] {
    return members.map((member: any) => {
      const tierId = member.relationships.currently_entitled_tiers.data[0]?.id;
      // eslint-disable-next-line mongoose-lean/require-lean
      const tier = tiers.find((tier: any) => tier.id === tierId);
      if (tier) {
        const tierTitle = tier.attributes.title;
        member.attributes.tier_name = Object.keys(patreonTierMapping).find(
          (key) => patreonTierMapping[key] === tierTitle
        );
      }
      return member;
    });
  }

  private async makeRequest(
    method: "get" | "post",
    url: string,
    data?: any,
    headers?: Record<string, unknown>
  ): Promise<any> {
    if (!this.isAccessTokenValid()) {
      await this.refreshAccessToken();
    }

    try {
      const response = await axios({
        method,
        url,
        data,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          ...headers,
        },
      });

      return response;
    } catch (error) {
      console.error("Failed to make request:", error);
    }
  }

  private isAccessTokenValid(): boolean {
    if (!this.accessToken || !this.accessTokenExpiration) {
      return false;
    }

    // Check if the current time is past the access token's expiration time
    return new Date() < this.accessTokenExpiration;
  }
}
