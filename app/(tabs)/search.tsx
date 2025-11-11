/**
 * Search Screen - Movie search functionality
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import MovieCard from '../../components/ui/MovieCard';
import { COLORS, LAYOUT, SIZES } from '../../constants/app';
import tmdbService from '../../services/tmdbService';
import { Movie } from '../../types';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      setError(null);
      setPage(1);

      try {
        const response = await tmdbService.searchMovies(query, 1);
        setSearchResults(response.results);
        setHasNextPage(response.page! < response.total_pages!);
      } catch (err) {
        setError('Failed to search movies. Please try again.');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const loadMore = async () => {
    if (!hasNextPage || loading || !searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await tmdbService.searchMovies(searchQuery, page + 1);
      setSearchResults(prev => [...prev, ...response.results]);
      setPage(prev => prev + 1);
      setHasNextPage(response.page! < response.total_pages!);
    } catch (err) {
      setError('Failed to load more results');
      console.error('Load more error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMoviePress = (movieId: number) => {
    router.push({
      pathname: '/movie-detail',
      params: { movieId: movieId.toString() },
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
  };

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <View style={styles.movieItem}>
      <MovieCard
        movie={item}
        onPress={handleMoviePress}
        width={SIZES.movieCard.width * 0.8}
      />
    </View>
  );

  const renderFooter = () => {
    if (!loading || searchResults.length === 0) return null;
    return (
      <View style={styles.footer}>
        <LoadingSpinner message="Loading more..." />
      </View>
    );
  };

  const renderContent = () => {
    if (!searchQuery.trim()) {
      return (
        <EmptyState
          icon="search"
          title="Search Movies"
          description="Enter a movie title to start searching"
        />
      );
    }

    if (loading && searchResults.length === 0) {
      return <LoadingSpinner message="Searching movies..." />;
    }

    if (error) {
      return (
        <EmptyState
          icon="alert-circle"
          title="Search Error"
          description={error}
          buttonText="Try Again"
          onButtonPress={() => debouncedSearch(searchQuery)}
        />
      );
    }

    if (searchResults.length === 0) {
      return (
        <EmptyState
          icon="film"
          title="No Results"
          description={`No movies found for "${searchQuery}"`}
        />
      );
    }

    return (
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMovieItem}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.resultsContainer}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Movies</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for movies..."
            placeholderTextColor={COLORS.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: LAYOUT.screenPadding,
    paddingTop: SIZES.spacing.large,
    paddingBottom: SIZES.spacing.normal,
  },
  headerTitle: {
    fontSize: SIZES.font.xxxlarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  searchContainer: {
    paddingHorizontal: LAYOUT.screenPadding,
    paddingBottom: SIZES.spacing.normal,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.normal,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.spacing.normal,
  },
  searchIcon: {
    marginRight: SIZES.spacing.small,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.font.medium,
    color: COLORS.text,
    paddingVertical: SIZES.spacing.normal,
  },
  clearButton: {
    padding: SIZES.spacing.tiny,
  },
  content: {
    flex: 1,
  },
  resultsContainer: {
    padding: LAYOUT.screenPadding,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.normal,
  },
  movieItem: {
    flex: 1,
    maxWidth: '30%',
  },
  footer: {
    paddingVertical: SIZES.spacing.large,
  },
});