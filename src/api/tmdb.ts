import { TMDB_API_KEY, TMDB_BASE_URL } from '../utils/constants';

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
}

interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

const fetchFromTMDB = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY!);
  
  for (const key in params) {
    url.searchParams.append(key, params[key]);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
};

export const getPopularMovies = async (): Promise<Movie[]> => {
  const data = await fetchFromTMDB<PaginatedResponse<Movie>>('/movie/popular');
  return data.results;
};

export const getTrendingMovies = async (): Promise<Movie[]> => {
  const data = await fetchFromTMDB<PaginatedResponse<Movie>>('/trending/movie/week');
  return data.results;
};

export const getTopRatedMovies = async (): Promise<Movie[]> => {
  const data = await fetchFromTMDB<PaginatedResponse<Movie>>('/movie/top_rated');
  return data.results;
};

export const getUpcomingMovies = async (): Promise<Movie[]> => {
  const data = await fetchFromTMDB<PaginatedResponse<Movie>>('/movie/upcoming');
  return data.results;
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
  if (!query) return [];
  const data = await fetchFromTMDB<PaginatedResponse<Movie>>('/search/movie', { query });
  return data.results;
};

export const getMovieDetails = async (id: number): Promise<Movie> => {
  return await fetchFromTMDB<Movie>(`/movie/${id}`);
};

export const getMovieVideos = async (id: number) => {
  const data = await fetchFromTMDB<{results: any[]}>(`/movie/${id}/videos`);
  return data.results;
};

export const getSimilarMovies = async (id: number): Promise<Movie[]> => {
  const data = await fetchFromTMDB<PaginatedResponse<Movie>>(`/movie/${id}/similar`);
  return data.results;
};