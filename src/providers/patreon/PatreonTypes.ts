interface IMemberAttributes {
  email: string;
  full_name: string;
  patron_status: string | null;
}

interface IMemberData {
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
  data: IMemberData[];
  links: ILinks;
  meta: IMeta;
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
