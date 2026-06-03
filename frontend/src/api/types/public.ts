export interface ApiPackage {
  id: number;
  name: string;
  slug: string;
  price: number | string;
  max_users: number;
  total_groups: number;
  validity_days: number;
  short_description: string | null;
  features: string[] | null;
  game_access: string[] | null;
  status: string;
  sort_order?: number;
}

export interface ApiActivity {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  icon?: string | null;
  status: string;
}

export interface ApiSubGame {
  id: number;
  title: string;
  case_summary: string | null;
  tagline: string | null;
  status: string;
}

export interface ApiGameDetails extends ApiActivity {
  sub_games: ApiSubGame[];
}

export interface ApiCmsPage {
  id: number;
  page_name: string;
  slug: string;
  title: string;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
}

export interface SiteSettings {
  website_name?: string;
  website_url?: string;
  tagline?: string;
  support_email?: string;
  contact_number?: string;
  whatsapp_number?: string;
  company_address?: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  [key: string]: string | undefined;
}
