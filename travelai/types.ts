export interface User {
  user_id: string;
  user_name: string;
  full_name: string;
  avatar_url: string;
}

export interface Place {
  place_id: string;
  place_name: string;
  address: string;
  thumb_url: string;
  description: string;
  content: string; // Markdown content
}

export interface Comment {
  id: string;
  username: string;
  place_id: string;
  content: string;
  date: string;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

export interface SummaryResponse {
  content: string;
}
