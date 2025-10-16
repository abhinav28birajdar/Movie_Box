import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { 
  getPopularMovies, 
  getTrendingMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  Movie 
} from '../../api/tmdb';
import { TMDB_IMAGE_BASE_URL } from '../../utils/constants';
import MovieCard from '../../components/MovieCard';
import LoadingOverlay from '../../components/LoadingOverlay';
import { StackScreenProps } from '@react-navigation/stack';
import { MovieStackParamList } from '../../navigation/AppNavigator';

type Props = StackScreenProps<MovieStackParamList, 'HomeList'>;

interface CategoryData {
  title: string;
  data: Movie[];
  loading: boolean;
  error: string | null;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [categories, setCategories] = useState<{
    popular: CategoryData;
    trending: CategoryData;
    topRated: CategoryData;
    upcoming: CategoryData;
  }>({
    popular: { title: 'Popular Movies', data: [], loading: true, error: null },
    trending: { title: 'Trending This Week', data: [], loading: true, error: null },
    topRated: { title: 'Top Rated', data: [], loading: true, error: null },
    upcoming: { title: 'Upcoming Movies', data: [], loading: true, error: null },
  });

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Fetch all categories in parallel
        const [popular, trending, topRated, upcoming] = await Promise.all([
          getPopularMovies(),
          getTrendingMovies(),
          getTopRatedMovies(),
          getUpcomingMovies(),
        ]);
        
        setCategories({
          popular: { 
            title: 'Popular Movies', 
            data: popular, 
            loading: false, 
            error: null 
          },
          trending: { 
            title: 'Trending This Week', 
            data: trending, 
            loading: false, 
            error: null 
          },
          topRated: { 
            title: 'Top Rated', 
            data: topRated, 
            loading: false, 
            error: null 
          },
          upcoming: { 
            title: 'Upcoming Movies', 
            data: upcoming, 
            loading: false, 
            error: null 
          },
        });
      } catch (err) {
        console.error('Error fetching movies:', err);
        // Update error states for categories
        setCategories(prev => ({
          popular: { ...prev.popular, loading: false, error: 'Failed to load popular movies.' },
          trending: { ...prev.trending, loading: false, error: 'Failed to load trending movies.' },
          topRated: { ...prev.topRated, loading: false, error: 'Failed to load top rated movies.' },
          upcoming: { ...prev.upcoming, loading: false, error: 'Failed to load upcoming movies.' },
        }));
      }
    };

    fetchMovies();
  }, []);

  // Check if all categories are still loading
  const isLoading = Object.values(categories).some(category => category.loading);

  if (isLoading) {
    return <LoadingOverlay isLoading={true} />;
  }

  const renderCategory = ({ item }: { item: CategoryData }) => {
    if (item.loading) {
      return (
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-2 px-4">{item.title}</Text>
          <LoadingOverlay isLoading={true} />
        </View>
      );
    }

    if (item.error || item.data.length === 0) {
      return (
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-2 px-4">{item.title}</Text>
          <Text className="text-red-500 px-4">
            {item.error || 'No movies found.'}
          </Text>
        </View>
      );
    }

    return (
      <View className="mb-6">
        <Text className="text-white text-xl font-bold mb-2 px-4">{item.title}</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={item.data}
          keyExtractor={(movie) => movie.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          renderItem={({ item: movie }) => (
            <View className="w-32 mx-2">
              <MovieCard
                id={movie.id}
                title={movie.title}
                poster_path={movie.poster_path}
                release_date={movie.release_date}
                vote_average={movie.vote_average}
                onPress={() => navigation.navigate('MovieDetail', { 
                  movieId: movie.id, 
                  movieTitle: movie.title 
                })}
              />
            </View>
          )}
        />
      </View>
    );
  };

  // Convert categories object to array for rendering
  const categoryArray = Object.values(categories);

  return (
    <ScrollView className="flex-1 bg-primary">
      <View className="mt-2">
        {categoryArray.map((category, index) => (
          <View key={index}>
            <Text className="text-white text-xl font-bold mb-2 px-4">{category.title}</Text>
            {category.loading ? (
              <View className="h-40 justify-center">
                <LoadingOverlay isLoading={true} />
              </View>
            ) : category.error ? (
              <Text className="text-red-500 px-4">{category.error}</Text>
            ) : (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={category.data}
                keyExtractor={(movie) => movie.id.toString()}
                contentContainerStyle={{ paddingHorizontal: 12 }}
                renderItem={({ item: movie }) => (
                  <TouchableOpacity 
                    className="w-32 mx-2"
                    onPress={() => navigation.navigate('MovieDetail', { 
                      movieId: movie.id, 
                      movieTitle: movie.title 
                    })}
                  >
                    <View className="rounded-lg overflow-hidden">
                      <Image 
                        source={{ 
                          uri: movie.poster_path ? 
                            `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : 
                            'https://via.placeholder.com/150x225?text=No+Image' 
                        }} 
                        className="w-32 h-48"
                      />
                    </View>
                    <Text className="text-white text-sm mt-1" numberOfLines={2}>{movie.title}</Text>
                    <Text className="text-light-300 text-xs">
                      {movie.vote_average ? `⭐ ${movie.vote_average.toFixed(1)}` : 'No rating'} 
                      {movie.release_date ? ` • ${movie.release_date.substring(0, 4)}` : ''}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <View className="my-4" />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;