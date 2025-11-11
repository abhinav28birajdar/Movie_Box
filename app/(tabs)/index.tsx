/**
 * Home/Discovery Screen - Main screen showing movie categories
 */

import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import MovieCard from '../../components/ui/MovieCard';
import SectionHeader from '../../components/ui/SectionHeader';
import { COLORS, LAYOUT, SIZES } from '../../constants/app';
import tmdbService from '../../services/tmdbService';
import { Movie } from '../../types';

interface MovieSection {
  title: string;
  movies: Movie[];
  loading: boolean;
  error: string | null;
}

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState<Record<string, MovieSection>>({
    popular: {
      title: 'Popular Movies',
      movies: [],
      loading: true,
      error: null,
    },
    nowPlaying: {
      title: 'Now Playing',
      movies: [],
      loading: true,
      error: null,
    },
    upcoming: {
      title: 'Upcoming',
      movies: [],
      loading: true,
      error: null,
    },
    topRated: {
      title: 'Top Rated',
      movies: [],
      loading: true,
      error: null,
    },
  });

  useEffect(() => {
    loadMovieSections();
  }, []);

  const loadMovieSections = async () => {
    try {
      const [popular, nowPlaying, upcoming, topRated] = await Promise.allSettled([
        tmdbService.getPopularMovies(),
        tmdbService.getNowPlayingMovies(),
        tmdbService.getUpcomingMovies(),
        tmdbService.getTopRatedMovies(),
      ]);

      setSections(prev => ({
        ...prev,
        popular: {
          ...prev.popular,
          movies: popular.status === 'fulfilled' ? popular.value.results : [],
          loading: false,
          error: popular.status === 'rejected' ? 'Failed to load popular movies' : null,
        },
        nowPlaying: {
          ...prev.nowPlaying,
          movies: nowPlaying.status === 'fulfilled' ? nowPlaying.value.results : [],
          loading: false,
          error: nowPlaying.status === 'rejected' ? 'Failed to load now playing movies' : null,
        },
        upcoming: {
          ...prev.upcoming,
          movies: upcoming.status === 'fulfilled' ? upcoming.value.results : [],
          loading: false,
          error: upcoming.status === 'rejected' ? 'Failed to load upcoming movies' : null,
        },
        topRated: {
          ...prev.topRated,
          movies: topRated.status === 'fulfilled' ? topRated.value.results : [],
          loading: false,
          error: topRated.status === 'rejected' ? 'Failed to load top rated movies' : null,
        },
      }));
    } catch (error) {
      console.error('Error loading movie sections:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setSections(prev => Object.keys(prev).reduce((acc, key) => ({
      ...acc,
      [key]: { ...prev[key], loading: true, error: null },
    }), {} as typeof prev));
    
    await loadMovieSections();
    setRefreshing(false);
  };

  const handleMoviePress = (movieId: number) => {
    router.push({
      pathname: '/movie-detail',
      params: { movieId: movieId.toString() },
    });
  };

  const handleViewAll = (sectionType: string) => {
    router.push({
      pathname: '/explore',
      params: { category: sectionType },
    });
  };

  const renderMovieSection = (sectionKey: string, section: MovieSection) => {
    if (section.loading) {
      return (
        <View style={styles.sectionContainer} key={sectionKey}>
          <SectionHeader title={section.title} />
          <LoadingSpinner />
        </View>
      );
    }

    if (section.error || section.movies.length === 0) {
      return (
        <View style={styles.sectionContainer} key={sectionKey}>
          <SectionHeader title={section.title} />
          <EmptyState
            title={section.error || 'No movies found'}
            description="Try refreshing the page"
          />
        </View>
      );
    }

    return (
      <View style={styles.sectionContainer} key={sectionKey}>
        <SectionHeader
          title={section.title}
          showViewAll
          onViewAllPress={() => handleViewAll(sectionKey)}
        />
        <FlatList
          horizontal
          data={section.movies.slice(0, 10)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MovieCard movie={item} onPress={handleMoviePress} />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.movieList}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MovieBox</Text>
        <Text style={styles.headerSubtitle}>Discover amazing movies</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(sections).map(([key, section]) =>
          renderMovieSection(key, section)
        )}
      </ScrollView>
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
  content: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: LAYOUT.sectionSpacing,
  },
  movieList: {
    paddingHorizontal: LAYOUT.screenPadding,
  },
});
