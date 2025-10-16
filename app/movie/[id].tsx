import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Share
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  fetchMovieDetails,
  fetchMovieVideos,
  fetchSimilarMovies,
  fetchMovieCredits,
  fetchOMDBMovieDetails,
  getImageUrl,
  MovieDetails as MovieDetailsType,
  CastMember,
  VideoResult,
  Movie
} from '@/services/movieApi';
import SavedMoviesService, { WatchProgress, UserRating } from '@/services/savedMoviesService';
import AuthService from '@/services/authService';
import VideoPlayer from '@/components/VideoPlayer';

export default function MovieDetails() {
  const { id } = useLocalSearchParams();
  const movieId = Number(id);
  
  // Movie data state
  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [omdbDetails, setOmdbDetails] = useState<any>(null);
  
  // User interaction state
  const [watchProgress, setWatchProgress] = useState<WatchProgress | null>(null);
  const [userRating, setUserRating] = useState<UserRating | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveCategory, setSaveCategory] = useState<'favorites' | 'watchlist' | 'watched' | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoResult | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [tempRating, setTempRating] = useState(0);

  useEffect(() => {
    if (movieId) {
      loadMovieData();
      if (AuthService.isAuthenticated()) {
        loadUserData();
      }
    }
  }, [movieId]);

  const loadMovieData = async () => {
    try {
      setLoading(true);
      
      // Load movie details with additional data
      const [movieData, videosData, creditsData, similarData] = await Promise.all([
        fetchMovieDetails(movieId),
        fetchMovieVideos(movieId),
        fetchMovieCredits(movieId),
        fetchSimilarMovies(movieId)
      ]);

      if (movieData) {
        setMovie(movieData);
        setVideos(videosData || []);
        setCast(creditsData?.cast?.slice(0, 10) || []);
        setSimilarMovies(similarData?.results?.slice(0, 10) || []);

        // Load OMDB details for additional info
        if (movieData.imdb_id) {
          const omdbData = await fetchOMDBMovieDetails(movieData.imdb_id);
          setOmdbDetails(omdbData);
        }
      }
    } catch (error) {
      console.error('Error loading movie data:', error);
      Alert.alert('Error', 'Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      // Load user's watch progress
      const progress = await SavedMoviesService.getMovieProgress(movieId);
      setWatchProgress(progress);

      // Load user's rating
      const rating = await SavedMoviesService.getMovieRating(movieId);
      setUserRating(rating);
      if (rating) {
        setTempRating(rating.rating);
      }

      // Check if movie is saved
      const saved = await SavedMoviesService.isMovieSaved(movieId);
      setIsSaved(saved);

      if (saved) {
        const category = await SavedMoviesService.getMovieCategory(movieId);
        setSaveCategory(category);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handlePlayMovie = () => {
    if (videos.length > 0) {
      const trailer = videos.find(v => v.type === 'Trailer') || videos[0];
      
      // In a real app, you would have actual movie URLs
      // For demo purposes, we'll use a placeholder
      Alert.alert(
        'Play Movie',
        'This would play the actual movie. For now, showing the trailer.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Play Trailer', 
            onPress: () => {
              setSelectedVideo(trailer);
              setShowVideoPlayer(true);
            }
          }
        ]
      );
    } else {
      Alert.alert('No Video Available', 'No videos found for this movie');
    }
  };

  const handleSaveMovie = async (category: 'favorites' | 'watchlist' | 'watched') => {
    if (!AuthService.isAuthenticated()) {
      router.push('./auth/signin');
      return;
    }

    if (!movie) return;

    try {
      if (isSaved && saveCategory === category) {
        // Remove from saved
        const success = await SavedMoviesService.removeMovie(movieId);
        if (success) {
          setIsSaved(false);
          setSaveCategory(null);
          Alert.alert('Success', 'Movie removed from your list');
        }
      } else {
        // Add to saved
        const success = await SavedMoviesService.saveMovie(movie, category);
        if (success) {
          setIsSaved(true);
          setSaveCategory(category);
          Alert.alert('Success', `Movie added to ${category}`);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update your list');
    }
  };

  const handleRateMovie = async () => {
    if (!AuthService.isAuthenticated()) {
      router.push('./auth/signin');
      return;
    }

    if (tempRating > 0) {
      const success = await SavedMoviesService.rateMovie(movieId, tempRating);
      if (success) {
        setUserRating({ movieId, rating: tempRating, ratedAt: new Date().toISOString() });
        setShowRatingModal(false);
        Alert.alert('Success', 'Rating saved successfully');
      } else {
        Alert.alert('Error', 'Failed to save rating');
      }
    }
  };

  const handleShareMovie = async () => {
    if (!movie) return;

    try {
      await Share.share({
        message: `Check out "${movie.title}" - ${movie.overview.substring(0, 100)}...`,
        title: movie.title,
        url: `https://www.themoviedb.org/movie/${movie.id}`
      });
    } catch (error) {
      console.error('Error sharing movie:', error);
    }
  };

  const formatRuntime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(amount);
  };

  const renderCastMember = ({ item }: { item: CastMember }) => (
    <TouchableOpacity className="mr-4 items-center" style={{ width: 80 }}>
      <Image
        source={{ 
          uri: item.profile_path 
            ? getImageUrl(item.profile_path, 'w500') 
            : undefined 
        }}
        className="w-16 h-16 rounded-full bg-gray-800 mb-2"
        resizeMode="cover"
      />
      <Text className="text-white text-xs text-center" numberOfLines={2}>
        {item.name}
      </Text>
      <Text className="text-gray-400 text-xs text-center" numberOfLines={1}>
        {item.character}
      </Text>
    </TouchableOpacity>
  );

  const renderSimilarMovie = ({ item }: { item: Movie }) => (
    <TouchableOpacity 
      className="mr-3"
      style={{ width: 120 }}
      onPress={() => router.push(`/movie/${item.id}`)}
    >
      <Image
        source={{ uri: getImageUrl(item.poster_path, 'w500') || undefined }}
        className="w-full h-36 rounded-lg bg-gray-800 mb-2"
        resizeMode="cover"
      />
      <Text className="text-white text-sm" numberOfLines={2}>
        {item.title}
      </Text>
      <View className="flex-row items-center mt-1">
        <Ionicons name="star" size={12} color="#FFD700" />
        <Text className="text-gray-400 text-xs ml-1">
          {item.vote_average.toFixed(1)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderRatingStars = (rating: number, onPress?: (rating: number) => void) => (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onPress?.(star)}
          disabled={!onPress}
        >
          <Ionicons
            name={star <= rating ? "star" : "star-outline"}
            size={24}
            color={star <= rating ? "#FFD700" : "#6B7280"}
            style={{ marginHorizontal: 2 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (!movie) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Ionicons name="film-outline" size={64} color="#6B7280" />
        <Text className="text-white text-xl mt-4">Movie not found</Text>
        <TouchableOpacity 
          className="bg-blue-600 px-6 py-3 rounded-lg mt-4"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showVideoPlayer && selectedVideo) {
    return (
      <VideoPlayer
        videoUrl={`https://www.youtube.com/watch?v=${selectedVideo.key}`}
        movieId={movieId}
        title={movie.title}
        poster={getImageUrl(movie.poster_path)}
        onClose={() => {
          setShowVideoPlayer(false);
          setSelectedVideo(null);
          loadUserData(); // Refresh user data after watching
        }}
      />
    );
  }

  return (
    <ScrollView className="flex-1 bg-black">
      {/* Hero Section */}
      <View className="relative">
        <Image
          source={{ uri: getImageUrl(movie.backdrop_path, 'w1280') || undefined }}
          className="w-full h-80"
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)', 'black']}
          className="absolute bottom-0 left-0 right-0 h-32"
        />
        
        {/* Back button */}
        <TouchableOpacity 
          className="absolute top-12 left-4 bg-black/50 rounded-full p-2"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Share button */}
        <TouchableOpacity 
          className="absolute top-12 right-4 bg-black/50 rounded-full p-2"
          onPress={handleShareMovie}
        >
          <Ionicons name="share-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Movie Info */}
      <View className="px-6 -mt-16 relative z-10">
        <View className="flex-row">
          <Image
            source={{ uri: getImageUrl(movie.poster_path, 'w500') || undefined }}
            className="w-24 h-36 rounded-lg bg-gray-800 mr-4"
            resizeMode="cover"
          />
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold mb-2" numberOfLines={2}>
              {movie.title}
            </Text>
            <View className="flex-row items-center mb-2">
              <View className="bg-yellow-500 px-2 py-1 rounded mr-2">
                <Text className="text-black text-xs font-bold">
                  {movie.vote_average.toFixed(1)}
                </Text>
              </View>
              <Text className="text-gray-400 text-sm">
                {movie.release_date?.split('-')[0]} • {formatRuntime(movie.runtime)}
              </Text>
            </View>
            <View className="flex-row flex-wrap">
              {movie.genres.slice(0, 3).map((genre, index) => (
                <Text key={genre.id} className="text-blue-400 text-sm mr-2">
                  {genre.name}{index < Math.min(movie.genres.length, 3) - 1 ? ' •' : ''}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Watch Progress */}
        {watchProgress && watchProgress.progress > 0 && (
          <View className="bg-gray-900 rounded-lg p-4 mt-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white text-sm">Continue Watching</Text>
              <Text className="text-gray-400 text-sm">
                {watchProgress.progress.toFixed(0)}% completed
              </Text>
            </View>
            <View className="bg-gray-700 h-2 rounded-full">
              <View 
                className="bg-red-600 h-full rounded-full"
                style={{ width: `${watchProgress.progress}%` }}
              />
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row mt-6 space-x-3">
          <TouchableOpacity 
            className="flex-1 bg-red-600 py-3 rounded-lg flex-row items-center justify-center"
            onPress={handlePlayMovie}
          >
            <Ionicons name="play" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">
              {watchProgress?.progress ? 'Continue' : 'Play'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`px-4 py-3 rounded-lg flex-row items-center justify-center ${
              isSaved && saveCategory === 'favorites' ? 'bg-red-600' : 'bg-gray-800'
            }`}
            onPress={() => handleSaveMovie('favorites')}
          >
            <Ionicons 
              name={isSaved && saveCategory === 'favorites' ? "heart" : "heart-outline"} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`px-4 py-3 rounded-lg flex-row items-center justify-center ${
              isSaved && saveCategory === 'watchlist' ? 'bg-blue-600' : 'bg-gray-800'
            }`}
            onPress={() => handleSaveMovie('watchlist')}
          >
            <Ionicons 
              name={isSaved && saveCategory === 'watchlist' ? "bookmark" : "bookmark-outline"} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>

        {/* User Rating */}
        <View className="mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-lg font-bold">Your Rating</Text>
            <TouchableOpacity 
              className="bg-gray-800 px-3 py-1 rounded"
              onPress={() => setShowRatingModal(true)}
            >
              <Text className="text-white text-sm">
                {userRating ? 'Update' : 'Rate'}
              </Text>
            </TouchableOpacity>
          </View>
          {renderRatingStars(userRating?.rating || 0)}
        </View>

        {/* Overview */}
        <View className="mt-6">
          <Text className="text-white text-lg font-bold mb-3">Overview</Text>
          <Text className="text-gray-300 text-base leading-6">
            {showFullOverview ? movie.overview : `${movie.overview.substring(0, 200)}...`}
          </Text>
          {movie.overview.length > 200 && (
            <TouchableOpacity 
              className="mt-2"
              onPress={() => setShowFullOverview(!showFullOverview)}
            >
              <Text className="text-blue-500 text-sm">
                {showFullOverview ? 'Show Less' : 'Show More'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Movie Details */}
        <View className="mt-6">
          <Text className="text-white text-lg font-bold mb-3">Details</Text>
          <View className="space-y-2">
            <View className="flex-row">
              <Text className="text-gray-400 w-20">Director:</Text>
              <Text className="text-white flex-1">
                {/* You would get this from credits data */}
                -
              </Text>
            </View>
            <View className="flex-row">
              <Text className="text-gray-400 w-20">Budget:</Text>
              <Text className="text-white flex-1">
                {movie.budget ? formatCurrency(movie.budget) : 'N/A'}
              </Text>
            </View>
            <View className="flex-row">
              <Text className="text-gray-400 w-20">Revenue:</Text>
              <Text className="text-white flex-1">
                {movie.revenue ? formatCurrency(movie.revenue) : 'N/A'}
              </Text>
            </View>
            <View className="flex-row">
              <Text className="text-gray-400 w-20">Status:</Text>
              <Text className="text-white flex-1">{movie.status}</Text>
            </View>
          </View>
        </View>

        {/* Cast */}
        {cast.length > 0 && (
          <View className="mt-6">
            <Text className="text-white text-lg font-bold mb-3">Cast</Text>
            <FlatList
              horizontal
              data={cast}
              keyExtractor={(item) => item.cast_id.toString()}
              renderItem={renderCastMember}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <View className="mt-6 mb-6">
            <Text className="text-white text-lg font-bold mb-3">Similar Movies</Text>
            <FlatList
              horizontal
              data={similarMovies}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderSimilarMovie}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}
      </View>

      {/* Rating Modal */}
      {showRatingModal && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
          <View className="bg-gray-900 rounded-xl p-6 mx-6 w-80">
            <Text className="text-white text-xl font-bold text-center mb-4">
              Rate this Movie
            </Text>
            <View className="items-center mb-6">
              {renderRatingStars(tempRating, setTempRating)}
            </View>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-gray-700 py-3 rounded-lg"
                onPress={() => {
                  setShowRatingModal(false);
                  setTempRating(userRating?.rating || 0);
                }}
              >
                <Text className="text-white text-center font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-blue-600 py-3 rounded-lg"
                onPress={handleRateMovie}
              >
                <Text className="text-white text-center font-semibold">Rate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
