/**
 * Supabase Database Service
 * Handles all database operations for user-generated content
 */

import { supabase } from '../lib/supabase';
import {
    ListMovie,
    MovieList,
    Review,
    UserProfile,
    WatchlistItem
} from '../types';

class DatabaseService {
  // Watchlist operations
  async getWatchlist(): Promise<WatchlistItem[]> {
    const { data, error } = await supabase
      .from('watchlists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addToWatchlist(movie: {
    movie_tmdb_id: number;
    title: string;
    poster_path?: string;
    release_date?: string;
    overview?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('watchlists')
      .insert([movie]);

    if (error) throw error;
  }

  async removeFromWatchlist(movieId: number): Promise<void> {
    const { error } = await supabase
      .from('watchlists')
      .delete()
      .eq('movie_tmdb_id', movieId);

    if (error) throw error;
  }

  async isInWatchlist(movieId: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('watchlists')
      .select('id')
      .eq('movie_tmdb_id', movieId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  // Review operations
  async getMovieReviews(movieId: number): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profile:profiles(username, avatar_url)
      `)
      .eq('movie_tmdb_id', movieId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getUserReview(movieId: number): Promise<Review | null> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('movie_tmdb_id', movieId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async addReview(review: {
    movie_tmdb_id: number;
    rating: number;
    comment?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .insert([review]);

    if (error) throw error;
  }

  async updateReview(movieId: number, updates: {
    rating?: number;
    comment?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('movie_tmdb_id', movieId);

    if (error) throw error;
  }

  async deleteReview(movieId: number): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('movie_tmdb_id', movieId);

    if (error) throw error;
  }

  // Movie Lists operations
  async getUserLists(): Promise<MovieList[]> {
    const { data, error } = await supabase
      .from('lists')
      .select(`
        *,
        list_movies(id)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(list => ({
      ...list,
      movies_count: list.list_movies?.length || 0,
    }));
  }

  async getPublicLists(): Promise<MovieList[]> {
    const { data, error } = await supabase
      .from('lists')
      .select(`
        *,
        profile:profiles(username, avatar_url),
        list_movies(id)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(list => ({
      ...list,
      movies_count: list.list_movies?.length || 0,
    }));
  }

  async createList(list: {
    name: string;
    description?: string;
    is_public?: boolean;
  }): Promise<string> {
    const { data, error } = await supabase
      .from('lists')
      .insert([list])
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async updateList(listId: string, updates: {
    name?: string;
    description?: string;
    is_public?: boolean;
  }): Promise<void> {
    const { error } = await supabase
      .from('lists')
      .update(updates)
      .eq('id', listId);

    if (error) throw error;
  }

  async deleteList(listId: string): Promise<void> {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId);

    if (error) throw error;
  }

  async getListMovies(listId: string): Promise<ListMovie[]> {
    const { data, error } = await supabase
      .from('list_movies')
      .select('*')
      .eq('list_id', listId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async addMovieToList(listId: string, movie: {
    movie_tmdb_id: number;
    title: string;
    poster_path?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('list_movies')
      .insert([{
        list_id: listId,
        ...movie,
      }]);

    if (error) throw error;
  }

  async removeMovieFromList(listId: string, movieId: number): Promise<void> {
    const { error } = await supabase
      .from('list_movies')
      .delete()
      .eq('list_id', listId)
      .eq('movie_tmdb_id', movieId);

    if (error) throw error;
  }

  // Profile operations
  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update(updates);

    if (error) throw error;
  }

  async uploadAvatar(userId: string, imageUri: string): Promise<string> {
    try {
      const fileName = `${userId}-${Date.now()}.jpg`;
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      return publicUrl.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }
}

export default new DatabaseService();