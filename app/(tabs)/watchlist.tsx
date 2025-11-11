/**
 * Watchlist Screen - User's saved movies
 */

import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import MovieCard from '../../components/ui/MovieCard';
import { COLORS, LAYOUT, SIZES } from '../../constants/app';
import databaseService from '../../services/databaseService';
import { WatchlistItem } from '../../types';

export default function WatchlistScreen() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadWatchlist();
    }, [])
  );

  const loadWatchlist = async () => {
    try {
      setError(null);
      const data = await databaseService.getWatchlist();
      setWatchlist(data);
    } catch (err) {
      setError('Failed to load watchlist');
      console.error('Watchlist error:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWatchlist();
    setRefreshing(false);
  };

  const handleMoviePress = (movieId: number) => {
    router.push({
      pathname: '/movie-detail',
      params: { movieId: movieId.toString() },
    });
  };

  const handleRemoveFromWatchlist = (item: WatchlistItem) => {
    Alert.alert(
      'Remove from Watchlist',
      `Remove "${item.title}" from your watchlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromWatchlist(item.movie_tmdb_id),
        },
      ]
    );
  };

  const removeFromWatchlist = async (movieId: number) => {
    try {
      await databaseService.removeFromWatchlist(movieId);
      setWatchlist(prev => prev.filter(item => item.movie_tmdb_id !== movieId));
    } catch (err) {
      Alert.alert('Error', 'Failed to remove movie from watchlist');
      console.error('Remove from watchlist error:', err);
    }
  };

  const renderWatchlistItem = ({ item }: { item: WatchlistItem }) => (
    <View style={styles.movieItemContainer}>
      <TouchableOpacity
        style={styles.movieItem}
        onPress={() => handleMoviePress(item.movie_tmdb_id)}
        activeOpacity={0.8}
      >
        <MovieCard
          movie={{
            id: item.movie_tmdb_id,
            title: item.title,
            poster_path: item.poster_path,
            release_date: item.release_date || '',
            overview: item.overview || '',
            vote_average: 0,
            vote_count: 0,
            genre_ids: [],
            adult: false,
            original_language: '',
            original_title: item.title,
            popularity: 0,
            video: false,
            backdrop_path: null,
          }}
          onPress={() => {}} // Handled by parent TouchableOpacity
          width={SIZES.movieCard.width}
          showTitle={true}
        />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFromWatchlist(item)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={20} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner message="Loading your watchlist..." />;
    }

    if (error) {
      return (
        <EmptyState
          icon="alert-circle"
          title="Error Loading Watchlist"
          description={error}
          buttonText="Try Again"
          onButtonPress={loadWatchlist}
        />
      );
    }

    if (watchlist.length === 0) {
      return (
        <EmptyState
          icon="bookmark-outline"
          title="Your Watchlist is Empty"
          description="Start adding movies to keep track of what you want to watch"
          buttonText="Discover Movies"
          onButtonPress={() => router.push('/search')}
        />
      );
    }

    return (
      <FlatList
        data={watchlist}
        keyExtractor={(item) => item.id}
        renderItem={renderWatchlistItem}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Watchlist</Text>
        {watchlist.length > 0 && (
          <Text style={styles.headerSubtitle}>
            {watchlist.length} movie{watchlist.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {renderContent()}
    </SafeAreaView>
  );
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
    marginBottom: SIZES.spacing.tiny,
  },
  headerSubtitle: {
    fontSize: SIZES.font.medium,
    color: COLORS.textSecondary,
  },
  listContainer: {
    padding: LAYOUT.screenPadding,
    paddingTop: 0,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.large,
  },
  movieItemContainer: {
    flex: 1,
    maxWidth: '30%',
    position: 'relative',
  },
  movieItem: {
    flex: 1,
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.round,
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});