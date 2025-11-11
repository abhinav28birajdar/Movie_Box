/**
 * Constants used throughout the MovieBox application
 */

export const COLORS = {
  primary: '#007AFF',
  secondary: '#FF6B6B',
  accent: '#FFD93D',
  background: '#000000',
  surface: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#2C2C2E',
  success: '#34C759',
  error: '#FF453A',
  warning: '#FF9500',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export const SIZES = {
  // Font sizes
  font: {
    tiny: 10,
    small: 12,
    normal: 14,
    medium: 16,
    large: 18,
    xlarge: 20,
    xxlarge: 24,
    xxxlarge: 32,
  },
  
  // Spacing
  spacing: {
    tiny: 4,
    small: 8,
    normal: 16,
    medium: 24,
    large: 32,
    xlarge: 48,
    xxlarge: 64,
  },
  
  // Radius
  radius: {
    small: 4,
    normal: 8,
    medium: 12,
    large: 16,
    xlarge: 24,
    round: 999,
  },
  
  // Movie card dimensions
  movieCard: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
  
  // Profile image sizes
  profileImage: {
    small: 40,
    medium: 60,
    large: 120,
  },
};

export const LAYOUT = {
  headerHeight: 60,
  tabBarHeight: 80,
  screenPadding: SIZES.spacing.normal,
  sectionSpacing: SIZES.spacing.medium,
};

export const ANIMATIONS = {
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};

export const API_ENDPOINTS = {
  // TMDB endpoints
  popular: '/movie/popular',
  nowPlaying: '/movie/now_playing',
  upcoming: '/movie/upcoming',
  topRated: '/movie/top_rated',
  search: '/search/movie',
  movieDetails: '/movie',
  movieVideos: '/movie/{id}/videos',
  similar: '/movie/{id}/similar',
  genres: '/genre/movie/list',
  discover: '/discover/movie',
  person: '/person',
  personMovies: '/person/{id}/movie_credits',
};