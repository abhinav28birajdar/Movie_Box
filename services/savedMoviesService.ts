import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from './authService';
import { Movie, MovieDetails } from './movieApi';

export interface SavedMovie {
  movie: Movie;
  savedAt: string;
  category: 'favorites' | 'watchlist' | 'watched';
  rating?: number;
  notes?: string;
}

export interface WatchProgress {
  movieId: number;
  progress: number; // 0-100 percentage
  duration: number; // total duration in seconds
  watchedAt: string;
  completed: boolean;
}

export interface UserRating {
  movieId: number;
  rating: number; // 1-5 stars
  review?: string;
  ratedAt: string;
}

const STORAGE_KEYS = {
  SAVED_MOVIES: 'saved_movies',
  WATCH_PROGRESS: 'watch_progress',
  USER_RATINGS: 'user_ratings',
  WATCH_HISTORY: 'watch_history',
  CONTINUE_WATCHING: 'continue_watching'
};

class SavedMoviesService {
  private static instance: SavedMoviesService;

  private constructor() {}

  public static getInstance(): SavedMoviesService {
    if (!SavedMoviesService.instance) {
      SavedMoviesService.instance = new SavedMoviesService();
    }
    return SavedMoviesService.instance;
  }

  // Saved Movies Management
  public async saveMovie(movie: Movie, category: 'favorites' | 'watchlist' | 'watched' = 'favorites'): Promise<boolean> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return false;

      const savedMovies = await this.getSavedMovies();
      const existingIndex = savedMovies.findIndex(saved => saved.movie.id === movie.id);

      const savedMovie: SavedMovie = {
        movie,
        savedAt: new Date().toISOString(),
        category
      };

      if (existingIndex >= 0) {
        savedMovies[existingIndex] = savedMovie;
      } else {
        savedMovies.push(savedMovie);
      }

      await this.storeSavedMovies(savedMovies);
      return true;
    } catch (error) {
      console.error('Error saving movie:', error);
      return false;
    }
  }

  public async removeMovie(movieId: number): Promise<boolean> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return false;

      const savedMovies = await this.getSavedMovies();
      const filteredMovies = savedMovies.filter(saved => saved.movie.id !== movieId);

      await this.storeSavedMovies(filteredMovies);
      return true;
    } catch (error) {
      console.error('Error removing movie:', error);
      return false;
    }
  }

  public async getSavedMovies(category?: 'favorites' | 'watchlist' | 'watched'): Promise<SavedMovie[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return [];

      const key = `${STORAGE_KEYS.SAVED_MOVIES}_${user.id}`;
      const stored = await AsyncStorage.getItem(key);
      const savedMovies: SavedMovie[] = stored ? JSON.parse(stored) : [];

      if (category) {
        return savedMovies.filter(saved => saved.category === category);
      }

      return savedMovies;
    } catch (error) {
      console.error('Error getting saved movies:', error);
      return [];
    }
  }

  public async isMovieSaved(movieId: number): Promise<boolean> {
    try {
      const savedMovies = await this.getSavedMovies();
      return savedMovies.some(saved => saved.movie.id === movieId);
    } catch (error) {
      console.error('Error checking if movie is saved:', error);
      return false;
    }
  }

  public async getMovieCategory(movieId: number): Promise<'favorites' | 'watchlist' | 'watched' | null> {
    try {
      const savedMovies = await this.getSavedMovies();
      const saved = savedMovies.find(saved => saved.movie.id === movieId);
      return saved?.category || null;
    } catch (error) {
      console.error('Error getting movie category:', error);
      return null;
    }
  }

  // Watch Progress Management
  public async updateWatchProgress(movieId: number, progress: number, duration: number): Promise<boolean> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return false;

      const watchProgress = await this.getWatchProgress();
      const existingIndex = watchProgress.findIndex(wp => wp.movieId === movieId);

      const progressData: WatchProgress = {
        movieId,
        progress: Math.max(0, Math.min(100, progress)),
        duration,
        watchedAt: new Date().toISOString(),
        completed: progress >= 90 // Consider 90%+ as completed
      };

      if (existingIndex >= 0) {
        watchProgress[existingIndex] = progressData;
      } else {
        watchProgress.push(progressData);
      }

      await this.storeWatchProgress(watchProgress);
      
      // If completed, add to watch history
      if (progressData.completed) {
        await this.addToWatchHistory(movieId);
      }

      return true;
    } catch (error) {
      console.error('Error updating watch progress:', error);
      return false;
    }
  }

  public async getWatchProgress(movieId?: number): Promise<WatchProgress[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return [];

      const key = `${STORAGE_KEYS.WATCH_PROGRESS}_${user.id}`;
      const stored = await AsyncStorage.getItem(key);
      const watchProgress: WatchProgress[] = stored ? JSON.parse(stored) : [];

      if (movieId) {
        return watchProgress.filter(wp => wp.movieId === movieId);
      }

      return watchProgress;
    } catch (error) {
      console.error('Error getting watch progress:', error);
      return [];
    }
  }

  public async getMovieProgress(movieId: number): Promise<WatchProgress | null> {
    try {
      const progressList = await this.getWatchProgress(movieId);
      return progressList.length > 0 ? progressList[0] : null;
    } catch (error) {
      console.error('Error getting movie progress:', error);
      return null;
    }
  }

  public async getContinueWatching(): Promise<WatchProgress[]> {
    try {
      const allProgress = await this.getWatchProgress();
      return allProgress
        .filter(wp => !wp.completed && wp.progress > 5) // More than 5% watched but not completed
        .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())
        .slice(0, 10); // Last 10 items
    } catch (error) {
      console.error('Error getting continue watching:', error);
      return [];
    }
  }

  // User Ratings Management
  public async rateMovie(movieId: number, rating: number, review?: string): Promise<boolean> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return false;

      if (rating < 1 || rating > 5) return false;

      const userRatings = await this.getUserRatings();
      const existingIndex = userRatings.findIndex(ur => ur.movieId === movieId);

      const ratingData: UserRating = {
        movieId,
        rating,
        review,
        ratedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        userRatings[existingIndex] = ratingData;
      } else {
        userRatings.push(ratingData);
      }

      await this.storeUserRatings(userRatings);
      return true;
    } catch (error) {
      console.error('Error rating movie:', error);
      return false;
    }
  }

  public async getUserRatings(): Promise<UserRating[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return [];

      const key = `${STORAGE_KEYS.USER_RATINGS}_${user.id}`;
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting user ratings:', error);
      return [];
    }
  }

  public async getMovieRating(movieId: number): Promise<UserRating | null> {
    try {
      const ratings = await this.getUserRatings();
      return ratings.find(rating => rating.movieId === movieId) || null;
    } catch (error) {
      console.error('Error getting movie rating:', error);
      return null;
    }
  }

  // Watch History Management
  public async addToWatchHistory(movieId: number): Promise<boolean> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return false;

      const history = await this.getWatchHistory();
      const existingIndex = history.findIndex(id => id === movieId);

      if (existingIndex >= 0) {
        // Move to front if already exists
        history.splice(existingIndex, 1);
      }

      history.unshift(movieId);
      
      // Keep only last 100 items
      const trimmedHistory = history.slice(0, 100);

      const key = `${STORAGE_KEYS.WATCH_HISTORY}_${user.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(trimmedHistory));
      return true;
    } catch (error) {
      console.error('Error adding to watch history:', error);
      return false;
    }
  }

  public async getWatchHistory(): Promise<number[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return [];

      const key = `${STORAGE_KEYS.WATCH_HISTORY}_${user.id}`;
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting watch history:', error);
      return [];
    }
  }

  public async clearWatchHistory(): Promise<boolean> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return false;

      const key = `${STORAGE_KEYS.WATCH_HISTORY}_${user.id}`;
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error clearing watch history:', error);
      return false;
    }
  }

  // Private helper methods
  private async storeSavedMovies(savedMovies: SavedMovie[]): Promise<void> {
    const user = AuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const key = `${STORAGE_KEYS.SAVED_MOVIES}_${user.id}`;
    await AsyncStorage.setItem(key, JSON.stringify(savedMovies));
  }

  private async storeWatchProgress(watchProgress: WatchProgress[]): Promise<void> {
    const user = AuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const key = `${STORAGE_KEYS.WATCH_PROGRESS}_${user.id}`;
    await AsyncStorage.setItem(key, JSON.stringify(watchProgress));
  }

  private async storeUserRatings(userRatings: UserRating[]): Promise<void> {
    const user = AuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const key = `${STORAGE_KEYS.USER_RATINGS}_${user.id}`;
    await AsyncStorage.setItem(key, JSON.stringify(userRatings));
  }

  // Statistics
  public async getStats(): Promise<{
    totalSaved: number;
    favorites: number;
    watchlist: number;
    watched: number;
    totalWatchTime: number; // in minutes
    averageRating: number;
  }> {
    try {
      const savedMovies = await this.getSavedMovies();
      const watchProgress = await this.getWatchProgress();
      const userRatings = await this.getUserRatings();

      const favorites = savedMovies.filter(sm => sm.category === 'favorites').length;
      const watchlist = savedMovies.filter(sm => sm.category === 'watchlist').length;
      const watched = savedMovies.filter(sm => sm.category === 'watched').length;

      const totalWatchTime = watchProgress.reduce((total, wp) => {
        return total + (wp.duration * wp.progress / 100 / 60); // Convert to minutes
      }, 0);

      const averageRating = userRatings.length > 0 
        ? userRatings.reduce((sum, ur) => sum + ur.rating, 0) / userRatings.length
        : 0;

      return {
        totalSaved: savedMovies.length,
        favorites,
        watchlist,
        watched,
        totalWatchTime: Math.round(totalWatchTime),
        averageRating: Math.round(averageRating * 10) / 10
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalSaved: 0,
        favorites: 0,
        watchlist: 0,
        watched: 0,
        totalWatchTime: 0,
        averageRating: 0
      };
    }
  }
}

export default SavedMoviesService.getInstance();