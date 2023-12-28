export type PatreonStatus = "active_patron" | "former_patron" | "declined_patron" | "all";

interface IMemberAttributes {
  email: string;
  full_name: string;
  patron_status: string | null;
  tier_name: string | null; // dynamically added by our API. This do not come from patreon
}

export interface IPatreonMemberData {
  attributes: IMemberAttributes;
  id: string;
  type: string;
}

interface IPaginationCursors {
  next: string;
}

interface IPagination {
  cursors: IPaginationCursors;
  total: number;
}

interface IMeta {
  pagination: IPagination;
}

interface ILinks {
  next: string;
}

export interface ICampaignMembersResponse {
  data: IPatreonMemberData[];
  links?: ILinks;
  meta?: IMeta;
}

interface ICampaignAttributes {
  // Add properties here if needed in the future
}

interface ICampaignData {
  attributes: ICampaignAttributes;
  id: string;
  type: string;
}

interface ICampaigns {
  data: ICampaignData[];
  meta: IMeta;
}

export interface ICampaignsResponse {
  campaigns: ICampaigns;
}
