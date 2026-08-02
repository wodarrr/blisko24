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
  promoted_until: string | null;

  urgent: boolean;
  urgent_until: string | null;

  featured: boolean;
  featured_until: string | null;

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

    reviews?: {
      rating: number | string | null;
    }[];
  } | null;
}