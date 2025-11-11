/**
 * TypeScript interfaces and types for MovieBox application
 */

// TMDB API Types
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
}

export interface MovieDetails extends Movie {
  runtime: number | null;
  genres: Genre[];
  budget: number;
  revenue: number;
  homepage: string | null;
  imdb_id: string | null;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string | null;
  belongs_to_collection: Collection | null;
  credits?: Credits;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface Collection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  credit_id: string;
  order: number;
  adult: boolean;
  gender: number | null;
  known_for_department: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  cast_id: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  credit_id: string;
  adult: boolean;
  gender: number | null;
  known_for_department: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
}

export interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface Person {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  homepage: string | null;
  imdb_id: string | null;
  known_for_department: string;
  place_of_birth: string | null;
  popularity: number;
  profile_path: string | null;
  adult: boolean;
  also_known_as: string[];
}

// Supabase Database Types
export interface UserProfile {
  id: string;
  updated_at: string;
  username: string;
  avatar_url: string | null;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  movie_tmdb_id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  overview: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  movie_tmdb_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  profile?: UserProfile;
}

export interface MovieList {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  profile?: UserProfile;
  list_movies?: ListMovie[];
  movies_count?: number;
}

export interface ListMovie {
  id: string;
  list_id: string;
  movie_tmdb_id: number;
  title: string;
  poster_path: string | null;
  added_at: string;
  order_index: number;
}

// API Response Types
export interface TMDBResponse<T> {
  page?: number;
  results: T[];
  total_pages?: number;
  total_results?: number;
}

export interface TMDBGenresResponse {
  genres: Genre[];
}

export interface TMDBVideosResponse {
  id: number;
  results: Video[];
}

export interface TMDBCreditsResponse {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

// Auth Types
export interface AuthUser {
  id: string;
  email?: string;
  profile?: UserProfile;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

// Navigation Types
export type RootStackParamList = {
  '(tabs)': undefined;
  'movie-detail': { movieId: number };
  'person-detail': { personId: number };
  'list-detail': { listId: string };
  'edit-list': { listId?: string };
  'edit-profile': undefined;
  modal: undefined;
};

export type TabParamList = {
  index: undefined;
  explore: undefined;
  search: undefined;
  watchlist: undefined;
  lists: undefined;
  profile: undefined;
};