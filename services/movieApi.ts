import axios from 'axios';
import FreeKeysManager from './freeKeysApi';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const OMDB_BASE_URL = 'https://www.omdbapi.com';

// Create axios instance for TMDB
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
});

// Create axios instance for OMDB  
const omdbApi = axios.create({
  baseURL: OMDB_BASE_URL,
});

// Add request interceptor to inject API keys
tmdbApi.interceptors.request.use(async (config) => {
  const apiKey = await FreeKeysManager.getTmdbKey();
  config.params = { ...config.params, api_key: apiKey };
  return config;
});

omdbApi.interceptors.request.use(async (config) => {
  const apiKey = await FreeKeysManager.getImdbKey();
  config.params = { ...config.params, apikey: apiKey };
  return config;
});

// Movie interfaces
export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  video: boolean;
  original_language: string;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  budget: number;
  revenue: number;
  tagline: string;
  homepage: string;
  imdb_id: string;
  status: string;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  spoken_languages: SpokenLanguage[];
  belongs_to_collection?: Collection;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path?: string;
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
  poster_path: string;
  backdrop_path: string;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface CastMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path?: string;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

export interface CrewMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path?: string;
  credit_id: string;
  department: string;
  job: string;
}

export interface VideoResult {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
}

// Utility function to get image URL
export const getImageUrl = (path: string, size: 'w500' | 'w780' | 'w1280' | 'original' = 'w500') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// API Functions
export const fetchPopularMovies = async (page: number = 1) => {
  try {
    const response = await tmdbApi.get('/movie/popular', {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

export const fetchTopRatedMovies = async (page: number = 1) => {
  try {
    const response = await tmdbApi.get('/movie/top_rated', {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

export const fetchNowPlayingMovies = async (page: number = 1) => {
  try {
    const response = await tmdbApi.get('/movie/now_playing', {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

export const fetchUpcomingMovies = async (page: number = 1) => {
  try {
    const response = await tmdbApi.get('/movie/upcoming', {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

export const fetchMoviesByGenre = async (genreId: number, page: number = 1) => {
  try {
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching movies by genre ${genreId}:`, error);
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

export const fetchMovieDetails = async (movieId: number): Promise<MovieDetails | null> => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}`, {
      params: {
        append_to_response: 'credits,videos,similar,recommendations'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie details for ${movieId}:`, error);
    return null;
  }
};

export const fetchMovieCredits = async (movieId: number): Promise<Credits | null> => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/credits`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie credits for ${movieId}:`, error);
    return null;
  }
};

export const fetchMovieVideos = async (movieId: number) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/videos`);
    return response.data.results;
  } catch (error) {
    console.error(`Error fetching movie videos for ${movieId}:`, error);
    return [];
  }
};

export const fetchSimilarMovies = async (movieId: number, page: number = 1) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/similar`, {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching similar movies for ${movieId}:`, error);
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

export const fetchRecommendedMovies = async (movieId: number, page: number = 1) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/recommendations`, {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching recommended movies for ${movieId}:`, error);
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

export const searchMovies = async (query: string, page: number = 1) => {
  try {
    const response = await tmdbApi.get('/search/movie', {
      params: {
        query,
        page,
        include_adult: false
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error searching movies for ${query}:`, error);
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

export const fetchGenres = async () => {
  try {
    const response = await tmdbApi.get('/genre/movie/list');
    return response.data.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
};

export const fetchTrendingMovies = async (timeWindow: 'day' | 'week' = 'week', page: number = 1) => {
  try {
    const response = await tmdbApi.get(`/trending/movie/${timeWindow}`, {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching trending movies:`, error);
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

// OMDB API functions for additional movie details
export const fetchOMDBMovieDetails = async (imdbId: string) => {
  try {
    const response = await omdbApi.get('/', {
      params: {
        i: imdbId,
        plot: 'full'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching OMDB details for ${imdbId}:`, error);
    return null;
  }
};
