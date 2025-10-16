import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SavedMoviesService, { SavedMovie } from '../../services/savedMoviesService';
import AuthService from '../../services/authService';
import { getImageUrl } from '../../services/movieApi';

type TabType = 'all' | 'favorites' | 'watchlist' | 'watched';

export default function Saved() {
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<SavedMovie[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  useEffect(() => {
    filterMovies();
  }, [savedMovies, activeTab]);

  const checkAuthAndLoadData = async () => {
    try {
      if (!AuthService.isAuthenticated()) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      await loadSavedMovies();
    } catch (error) {
      console.error('Error checking auth and loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedMovies = async () => {
    try {
      const movies = await SavedMoviesService.getSavedMovies();
      setSavedMovies(movies);
    } catch (error) {
      console.error('Error loading saved movies:', error);
      Alert.alert('Error', 'Failed to load saved movies');
    }
  };

  const filterMovies = () => {
    if (activeTab === 'all') {
      setFilteredMovies(savedMovies);
    } else {
      setFilteredMovies(savedMovies.filter(movie => movie.category === activeTab));
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSavedMovies();
    setRefreshing(false);
  }, []);

  const handleRemoveMovie = async (movieId: number) => {
    Alert.alert(
      'Remove Movie',
      'Are you sure you want to remove this movie from your list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const success = await SavedMoviesService.removeMovie(movieId);
            if (success) {
              await loadSavedMovies();
              Alert.alert('Success', 'Movie removed from your list');
            } else {
              Alert.alert('Error', 'Failed to remove movie');
            }
          }
        }
      ]
    );
  };

  const handleMoviePress = (movieId: number) => {
    router.push(`/movie/${movieId}`);
  };

  const renderTabButton = (tab: TabType, label: string, count: number) => (
    <TouchableOpacity
      key={tab}
      className={`px-4 py-2 rounded-full mr-3 ${
        activeTab === tab ? 'bg-blue-600' : 'bg-gray-800'
      }`}
      onPress={() => setActiveTab(tab)}
    >
      <Text className={`text-sm font-medium ${
        activeTab === tab ? 'text-white' : 'text-gray-300'
      }`}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const renderMovieCard = ({ item }: { item: SavedMovie }) => (
    <TouchableOpacity
      className="bg-gray-900 rounded-xl mb-4 overflow-hidden"
      onPress={() => handleMoviePress(item.movie.id)}
    >
      <View className="flex-row">
        <Image
          source={{ uri: getImageUrl(item.movie.poster_path, 'w500') || undefined }}
          className="w-24 h-36 bg-gray-800"
          resizeMode="cover"
        />
        <View className="flex-1 p-4">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-white text-lg font-bold flex-1 mr-2" numberOfLines={2}>
              {item.movie.title}
            </Text>
            <TouchableOpacity
              onPress={() => handleRemoveMovie(item.movie.id)}
              className="bg-red-600/20 rounded-full p-1"
            >
              <Ionicons name="close" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-gray-400 text-sm mb-2" numberOfLines={3}>
            {item.movie.overview}
          </Text>
          
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text className="text-white text-sm ml-1">
                {item.movie.vote_average.toFixed(1)}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <View className={`px-2 py-1 rounded-full ${
                item.category === 'favorites' ? 'bg-red-600/20' :
                item.category === 'watchlist' ? 'bg-blue-600/20' :
                'bg-green-600/20'
              }`}>
                <Text className={`text-xs font-medium ${
                  item.category === 'favorites' ? 'text-red-400' :
                  item.category === 'watchlist' ? 'text-blue-400' :
                  'text-green-400'
                }`}>
                  {item.category === 'favorites' ? 'Favorite' :
                   item.category === 'watchlist' ? 'Watchlist' :
                   'Watched'}
                </Text>
              </View>
            </View>
          </View>
          
          <Text className="text-gray-500 text-xs mt-2">
            Added {new Date(item.savedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-6">
      <Ionicons 
        name={
          activeTab === 'favorites' ? 'heart-outline' :
          activeTab === 'watchlist' ? 'bookmark-outline' :
          activeTab === 'watched' ? 'checkmark-circle-outline' :
          'film-outline'
        } 
        size={80} 
        color="#6B7280" 
      />
      <Text className="text-white text-xl font-bold mt-4 mb-2">
        {activeTab === 'all' ? 'No Saved Movies' :
         activeTab === 'favorites' ? 'No Favorites' :
         activeTab === 'watchlist' ? 'No Watchlist Items' :
         'No Watched Movies'}
      </Text>
      <Text className="text-gray-400 text-center mb-6">
        {activeTab === 'all' ? 'Start exploring movies and add them to your collection' :
         activeTab === 'favorites' ? 'Movies you love will appear here' :
         activeTab === 'watchlist' ? 'Movies you want to watch later will appear here' :
         'Movies you\'ve completed will appear here'}
      </Text>
      <TouchableOpacity 
        className="bg-blue-600 px-6 py-3 rounded-lg"
        onPress={() => router.push('/(tabs)')}
      >
        <Text className="text-white font-semibold">Explore Movies</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-black justify-center items-center px-6">
        <Ionicons name="lock-closed" size={80} color="#6B7280" />
        <Text className="text-white text-xl font-bold mt-4 mb-2">Sign In Required</Text>
        <Text className="text-gray-400 text-center mb-6">
          Sign in to access your saved movies, favorites, and watchlist
        </Text>
        <TouchableOpacity 
          className="bg-blue-600 px-6 py-3 rounded-lg mb-3"
          onPress={() => router.push('./auth/signin')}
        >
          <Text className="text-white font-semibold">Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="bg-gray-800 px-6 py-3 rounded-lg"
          onPress={() => router.push('./auth/signup')}
        >
          <Text className="text-white font-semibold">Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const favoritesCount = savedMovies.filter(m => m.category === 'favorites').length;
  const watchlistCount = savedMovies.filter(m => m.category === 'watchlist').length;
  const watchedCount = savedMovies.filter(m => m.category === 'watched').length;

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="px-6 pt-12 pb-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-white text-2xl font-bold">My Movies</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="bg-gray-900 rounded-xl p-4 mb-6">
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-white text-xl font-bold">{savedMovies.length}</Text>
              <Text className="text-gray-400 text-sm">Total Saved</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-xl font-bold">{favoritesCount}</Text>
              <Text className="text-gray-400 text-sm">Favorites</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-xl font-bold">{watchlistCount}</Text>
              <Text className="text-gray-400 text-sm">Watchlist</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-xl font-bold">{watchedCount}</Text>
              <Text className="text-gray-400 text-sm">Watched</Text>
            </View>
          </View>
        </View>

        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {renderTabButton('all', 'All', savedMovies.length)}
          {renderTabButton('favorites', 'Favorites', favoritesCount)}
          {renderTabButton('watchlist', 'Watchlist', watchlistCount)}
          {renderTabButton('watched', 'Watched', watchedCount)}
        </ScrollView>
      </View>

      {/* Movies List */}
      {filteredMovies.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredMovies}
          keyExtractor={(item) => `${item.movie.id}-${item.category}`}
          renderItem={renderMovieCard}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}