import { 
  Image, 
  ScrollView, 
  Text, 
  View, 
  ActivityIndicator, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  Dimensions
} from "react-native";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { 
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchNowPlayingMovies,
  fetchUpcomingMovies,
  fetchTrendingMovies,
  fetchGenres,
  getImageUrl,
  Movie,
  Genre
} from "@/services/movieApi";
import SavedMoviesService from "@/services/savedMoviesService";
import AuthService from "@/services/authService";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface MovieCategory {
  title: string;
  data: Movie[];
  loading: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const MOVIE_CARD_WIDTH = screenWidth * 0.32;

export default function Index() {
  const router = useRouter();
  const [categories, setCategories] = useState<MovieCategory[]>([
    { title: 'Trending This Week', data: [], loading: true },
    { title: 'Popular Movies', data: [], loading: true },
    { title: 'Top Rated', data: [], loading: true },
    { title: 'Now Playing', data: [], loading: true },
    { title: 'Upcoming', data: [], loading: true }
  ]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    loadInitialData();
  }, []);

  const checkAuthStatus = () => {
    setIsAuthenticated(AuthService.isAuthenticated());
  };

  const loadInitialData = async () => {
    try {
      // Load genres
      const genresData = await fetchGenres();
      setGenres(genresData);

      // Load movie categories
      await Promise.all([
        loadTrending(),
        loadPopular(),
        loadTopRated(),
        loadNowPlaying(),
        loadUpcoming()
      ]);

      // Load continue watching if authenticated
      if (AuthService.isAuthenticated()) {
        await loadContinueWatching();
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadTrending = async () => {
    try {
      const response = await fetchTrendingMovies('week');
      updateCategoryData('Trending This Week', response.results.slice(0, 10));
      if (response.results.length > 0) {
        setFeaturedMovie(response.results[0]);
      }
    } catch (error) {
      console.error('Error loading trending movies:', error);
      updateCategoryData('Trending This Week', []);
    }
  };

  const loadPopular = async () => {
    try {
      const response = await fetchPopularMovies();
      updateCategoryData('Popular Movies', response.results.slice(0, 10));
    } catch (error) {
      console.error('Error loading popular movies:', error);
      updateCategoryData('Popular Movies', []);
    }
  };

  const loadTopRated = async () => {
    try {
      const response = await fetchTopRatedMovies();
      updateCategoryData('Top Rated', response.results.slice(0, 10));
    } catch (error) {
      console.error('Error loading top rated movies:', error);
      updateCategoryData('Top Rated', []);
    }
  };

  const loadNowPlaying = async () => {
    try {
      const response = await fetchNowPlayingMovies();
      updateCategoryData('Now Playing', response.results.slice(0, 10));
    } catch (error) {
      console.error('Error loading now playing movies:', error);
      updateCategoryData('Now Playing', []);
    }
  };

  const loadUpcoming = async () => {
    try {
      const response = await fetchUpcomingMovies();
      updateCategoryData('Upcoming', response.results.slice(0, 10));
    } catch (error) {
      console.error('Error loading upcoming movies:', error);
      updateCategoryData('Upcoming', []);
    }
  };

  const loadContinueWatching = async () => {
    try {
      const progress = await SavedMoviesService.getContinueWatching();
      setContinueWatching(progress);
    } catch (error) {
      console.error('Error loading continue watching:', error);
    }
  };

  const updateCategoryData = (title: string, data: Movie[]) => {
    setCategories(prev => prev.map(category => 
      category.title === title 
        ? { ...category, data, loading: false }
        : category
    ));
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  const handleMoviePress = (movieId: number) => {
    router.push(`/movie/${movieId}`);
  };

  const handleSaveMovie = async (movie: Movie) => {
    if (!isAuthenticated) {
      router.push('./auth/signin');
      return;
    }
    
    const success = await SavedMoviesService.saveMovie(movie, 'favorites');
    if (success) {
      // Show success feedback
    }
  };

  const renderMovieCard = ({ item }: { item: Movie }) => (
    <TouchableOpacity 
      className="mr-3"
      onPress={() => handleMoviePress(item.id)}
      style={{ width: MOVIE_CARD_WIDTH }}
    >
      <View className="relative">
        <Image
          source={{ uri: getImageUrl(item.poster_path, 'w500') || undefined }}
          className="w-full h-40 rounded-lg bg-gray-800"
          resizeMode="cover"
        />
        <TouchableOpacity
          className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
          onPress={() => handleSaveMovie(item)}
        >
          <Ionicons name="heart-outline" size={20} color="white" />
        </TouchableOpacity>
        <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-lg">
          <Text className="text-white text-xs font-semibold" numberOfLines={2}>
            {item.title}
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text className="text-white text-xs ml-1">
              {item.vote_average.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGenreChip = ({ item }: { item: Genre }) => (
    <TouchableOpacity 
      className="bg-gray-800 rounded-full px-4 py-2 mr-2"
      onPress={() => console.log(`Browse ${item.name} movies`)}
    >
      <Text className="text-white text-sm">{item.name}</Text>
    </TouchableOpacity>
  );

  const renderFeaturedMovie = () => {
    if (!featuredMovie) return null;

    return (
      <TouchableOpacity 
        className="relative h-64 mx-5 mb-6 rounded-xl overflow-hidden"
        onPress={() => handleMoviePress(featuredMovie.id)}
      >
        <Image
          source={{ uri: getImageUrl(featuredMovie.backdrop_path, 'w1280') || undefined }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          className="absolute bottom-0 left-0 right-0 p-4"
        >
          <Text className="text-white text-xl font-bold mb-1" numberOfLines={2}>
            {featuredMovie.title}
          </Text>
          <Text className="text-gray-300 text-sm mb-2" numberOfLines={2}>
            {featuredMovie.overview}
          </Text>
          <View className="flex-row items-center">
            <TouchableOpacity className="bg-red-600 px-4 py-2 rounded-lg flex-row items-center">
              <Ionicons name="play" size={16} color="white" />
              <Text className="text-white font-semibold ml-2">Play</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-gray-800/80 px-4 py-2 rounded-lg flex-row items-center ml-3"
              onPress={() => handleSaveMovie(featuredMovie)}
            >
              <Ionicons name="add" size={16} color="white" />
              <Text className="text-white font-semibold ml-2">My List</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderContinueWatching = () => {
    if (!isAuthenticated || continueWatching.length === 0) return null;

    return (
      <View className="mb-6">
        <Text className="text-white text-xl font-bold mb-4 px-5">Continue Watching</Text>
        <FlatList
          horizontal
          data={continueWatching}
          keyExtractor={(item) => item.movieId.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              className="mr-3 ml-5"
              onPress={() => handleMoviePress(item.movieId)}
              style={{ width: MOVIE_CARD_WIDTH }}
            >
              <View className="relative">
                <View className="w-full h-40 bg-gray-800 rounded-lg justify-center items-center">
                  <Ionicons name="play-circle" size={48} color="white" />
                </View>
                <View className="absolute bottom-0 left-0 right-0 bg-red-600 h-1 rounded-b-lg">
                  <View 
                    className="h-full bg-red-400 rounded-b-lg"
                    style={{ width: `${item.progress}%` }}
                  />
                </View>
              </View>
              <Text className="text-white text-xs mt-2" numberOfLines={2}>
                {item.progress.toFixed(0)}% watched
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  const renderMovieCategory = (category: MovieCategory) => (
    <View key={category.title} className="mb-6">
      <View className="flex-row justify-between items-center px-5 mb-4">
        <Text className="text-white text-xl font-bold">{category.title}</Text>
        <TouchableOpacity>
          <Text className="text-blue-500 text-sm">See All</Text>
        </TouchableOpacity>
      </View>
      
      {category.loading ? (
        <View className="h-40 justify-center items-center">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <FlatList
          horizontal
          data={category.data}
          keyExtractor={(item) => `${category.title}-${item.id}`}
          renderItem={renderMovieCard}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20 }}
        />
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-black">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-5 pt-12 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Image source={icons.logo} className="w-12 h-10" />
            <View className="flex-row space-x-4">
              <TouchableOpacity onPress={() => router.push('/search')}>
                <Ionicons name="search" size={28} color="white" />
              </TouchableOpacity>
              {isAuthenticated ? (
                <TouchableOpacity onPress={() => router.push('/profile')}>
                  <Ionicons name="person-circle" size={28} color="white" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => router.push('./auth/signin')}>
                  <Ionicons name="log-in" size={28} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <SearchBar
            onPress={() => router.push("/search")}
            placeholder="Search for movies, actors, genres..."
            value=""
            onChangeText={() => {}}
          />
        </View>

        {/* Genres */}
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-4 px-5">Browse by Genre</Text>
          <FlatList
            horizontal
            data={genres}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderGenreChip}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>

        {/* Featured Movie */}
        {renderFeaturedMovie()}

        {/* Continue Watching */}
        {renderContinueWatching()}

        {/* Movie Categories */}
        {categories.map(renderMovieCategory)}
      </ScrollView>
    </View>
  );
}