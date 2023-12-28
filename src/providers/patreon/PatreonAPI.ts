import { appEnv } from "@providers/config/env";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import axios from "axios";
import qs from "qs";
import { ICampaignMembersResponse, ICampaignsResponse } from "./PatreonTypes";

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

  constructor(private inMemoryHashTable: InMemoryHashTable) {}

  public async initialize(): Promise<void> {
    try {
      if (!this.clientId || !this.clientSecret || !this.redirectURI || !this.campaignId) {
        throw new Error(`Failed to authenticate with Patreon API.
          Some of these credentials are missing:
          clientId: ${this.clientId}
          clientSecret: ${this.clientSecret}
          redirectURI: ${this.redirectURI}
          campaignId: ${this.campaignId}
        `);
      }

      const patreonCredentials = await this.inMemoryHashTable.get("patreon-api", "credentials");

      if (!patreonCredentials) {
        throw new Error(
          "Failed to authenticate with Patreon API: Missing credentials. Please authenticate reaching the /patreon/authenticate endpoint"
        );
      }

      this.accessToken = patreonCredentials.access_token;
      this.refreshToken = patreonCredentials.refresh_token;
      const expiresIn = patreonCredentials.expires_in;

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

  public async validateReceiptOfOauthToken(code: string): Promise<void> {
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

      await this.inMemoryHashTable.delete("patreon-api", "credentials");

      await this.inMemoryHashTable.set("patreon-api", "credentials", {
        access_token,
        refresh_token,
        expires_in,
      });
    } catch (error) {
      console.error(error);
    }
  }

  public async fetchCampaigns(): Promise<ICampaignsResponse | undefined> {
    try {
      const response = await axios.get("https://www.patreon.com/api/oauth2/v2/campaigns", {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  public async getCampaignMemberships(campaignId: string): Promise<ICampaignMembersResponse | undefined> {
    try {
      if (!campaignId) {
        throw new Error("Missing campaignId");
      }

      const fields = encodeURIComponent("fields[member]") + "=email,full_name,patron_status";
      const response = await axios.get(
        `https://www.patreon.com/api/oauth2/v2/campaigns/${campaignId}/members?${fields}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error", error.message);
      }
    }
  }

  private async makeRequest(url: string, headers?: Record<string, unknown>): Promise<any> {
    if (!this.isAccessTokenValid()) {
      await this.refreshAccessToken();
    }

    try {
      const response = await axios.get(url, {
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
