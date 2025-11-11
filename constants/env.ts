/**
 * Environment configuration for MovieBox
 * Add your API keys here or use environment variables
 */

export const ENV_CONFIG = {
  // TMDB API Configuration
  TMDB_API_KEY: 'YOUR_TMDB_API_KEY_HERE', // Get from https://www.themoviedb.org/settings/api
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  
  // Supabase Configuration
  SUPABASE_URL: 'YOUR_SUPABASE_URL_HERE', // Your Supabase project URL
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY_HERE', // Your Supabase anon key
};

// Image sizes for different use cases
export const IMAGE_SIZES = {
  poster: {
    small: 'w154',
    medium: 'w342',
    large: 'w500',
    original: 'original',
  },
  backdrop: {
    small: 'w300',
    medium: 'w780',
    large: 'w1280',
    original: 'original',
  },
  profile: {
    small: 'w45',
    medium: 'w185',
    large: 'h632',
    original: 'original',
  },
};