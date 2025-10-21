import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Profile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  location?: string;
  birth_date?: string;
  preferences: {
    favorite_genres: string[];
    preferred_language: string;
    theme: 'light' | 'dark';
    notifications_enabled: boolean;
    public_profile: boolean;
  };
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  movie_id: number;
  movie_title: string;
  movie_poster_path?: string;
  movie_release_date?: string;
  movie_rating?: number;
  status: 'favorites' | 'watch_later' | 'watched';
  personal_rating?: number;
  notes?: string;
  date_watched?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  movie_id: number;
  movie_title: string;
  rating: number;
  review_text?: string;
  is_spoiler: boolean;
  likes_count: number;
  reports_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower_profile?: Profile;
  following_profile?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'movie_release' | 'recommendation' | 'social' | 'system';
  title: string;
  message: string;
  data: any;
  read: boolean;
  action_url?: string;
  created_at: string;
}