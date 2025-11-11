/**
 * TMDB API Service
 * Handles all interactions with The Movie Database API
 */

import { API_ENDPOINTS } from '../constants/app';
import { ENV_CONFIG } from '../constants/env';
import {
    Genre,
    Movie,
    MovieDetails,
    Person,
    TMDBCreditsResponse,
    TMDBGenresResponse,
    TMDBResponse,
    TMDBVideosResponse,
    Video,
} from '../types';

class TMDBService {
  private baseURL = ENV_CONFIG.TMDB_BASE_URL;
  private apiKey = ENV_CONFIG.TMDB_API_KEY;

  private async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    url.searchParams.append('api_key', this.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('TMDB API request failed:', error);
      throw error;
    }
  }

  // Movies
  async getPopularMovies(page = 1): Promise<TMDBResponse<Movie>> {
    return this.request<TMDBResponse<Movie>>(API_ENDPOINTS.popular, { page });
  }

  async getNowPlayingMovies(page = 1): Promise<TMDBResponse<Movie>> {
    return this.request<TMDBResponse<Movie>>(API_ENDPOINTS.nowPlaying, { page });
  }

  async getUpcomingMovies(page = 1): Promise<TMDBResponse<Movie>> {
    return this.request<TMDBResponse<Movie>>(API_ENDPOINTS.upcoming, { page });
  }

  async getTopRatedMovies(page = 1): Promise<TMDBResponse<Movie>> {
    return this.request<TMDBResponse<Movie>>(API_ENDPOINTS.topRated, { page });
  }

  async searchMovies(query: string, page = 1): Promise<TMDBResponse<Movie>> {
    return this.request<TMDBResponse<Movie>>(API_ENDPOINTS.search, { query, page });
  }

  async getMovieDetails(movieId: number): Promise<MovieDetails> {
    return this.request<MovieDetails>(`${API_ENDPOINTS.movieDetails}/${movieId}`, {
      append_to_response: 'credits,videos,similar,reviews',
    });
  }

  async getSimilarMovies(movieId: number, page = 1): Promise<TMDBResponse<Movie>> {
    return this.request<TMDBResponse<Movie>>(`${API_ENDPOINTS.movieDetails}/${movieId}/similar`, { page });
  }

  async getMovieVideos(movieId: number): Promise<TMDBVideosResponse> {
    return this.request<TMDBVideosResponse>(`${API_ENDPOINTS.movieDetails}/${movieId}/videos`);
  }

  async getMovieCredits(movieId: number): Promise<TMDBCreditsResponse> {
    return this.request<TMDBCreditsResponse>(`${API_ENDPOINTS.movieDetails}/${movieId}/credits`);
  }

  // Genres
  async getGenres(): Promise<Genre[]> {
    const response = await this.request<TMDBGenresResponse>(API_ENDPOINTS.genres);
    return response.genres;
  }

  async getMoviesByGenre(genreId: number, page = 1): Promise<TMDBResponse<Movie>> {
    return this.request<TMDBResponse<Movie>>(API_ENDPOINTS.discover, {
      with_genres: genreId,
      page,
      sort_by: 'popularity.desc',
    });
  }

  // People
  async getPersonDetails(personId: number): Promise<Person> {
    return this.request<Person>(`${API_ENDPOINTS.person}/${personId}`);
  }

  async getPersonMovies(personId: number): Promise<any> {
    return this.request(`${API_ENDPOINTS.person}/${personId}/movie_credits`);
  }

  // Utility methods
  getImageUrl(path: string | null, size: 'w154' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500'): string | null {
    if (!path) return null;
    return `${ENV_CONFIG.TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  getYouTubeTrailerUrl(videos: Video[]): string | null {
    const trailer = videos.find(
      video => video.site === 'YouTube' && 
      (video.type === 'Trailer' || video.type === 'Teaser') &&
      video.official
    );
    
    if (!trailer) return null;
    return `https://www.youtube.com/watch?v=${trailer.key}`;
  }

  // Advanced search and filtering
  async discoverMovies(options: {
    genreIds?: number[];
    year?: number;
    sortBy?: string;
    minRating?: number;
    page?: number;
  } = {}): Promise<TMDBResponse<Movie>> {
    const params: Record<string, any> = {
      page: options.page || 1,
      sort_by: options.sortBy || 'popularity.desc',
    };

    if (options.genreIds && options.genreIds.length > 0) {
      params.with_genres = options.genreIds.join(',');
    }

    if (options.year) {
      params.year = options.year;
    }

    if (options.minRating) {
      params['vote_average.gte'] = options.minRating;
    }

    return this.request<TMDBResponse<Movie>>(API_ENDPOINTS.discover, params);
  }
}

export default new TMDBService();