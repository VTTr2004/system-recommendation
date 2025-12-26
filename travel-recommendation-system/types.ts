
export interface User {
  user_id: string;
  user_name: string;
  full_name: string;
  avatar_url: string;
  role?: 'user' | 'admin';
}

export interface Place {
  place_id: string;
  place_name: string;
  address: string;
  thumb_url: string;
  description: string;
  content: string;
}

export interface UserPlace {
  user_id: string;
  place_id: string;
}

export interface Comment {
  id: string;
  username: string;
  place_id: string;
  content: string;
  date: string;
  rating: number;
  place_name?: string; // Helpful for admin views
}

export interface RecommendationRequest {
  user_id: string;
  query?: string;
}
