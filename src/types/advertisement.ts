export interface Advertisement {
  id: number;
  user_id: string | null;

  title: string;
  description: string;

  category: string;

  city: string;
  province: string;

  price: number | string;

  image_url: string | null;

  promoted: boolean;
  urgent: boolean;
  promoted_until: string | null;

  views: number;

  created_at: string;

  favorites?: {
    id: number;
  }[];

  profiles?: {
    name: string | null;
    city: string | null;
    avatar_url: string | null;
    verified?: boolean;
  } | null;
}