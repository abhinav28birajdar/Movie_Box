/**
 * Reusable Movie Card Component
 */

import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS, SIZES } from '../../constants/app';
import { ENV_CONFIG, IMAGE_SIZES } from '../../constants/env';
import { Movie } from '../../types';

interface MovieCardProps {
  movie: Movie;
  onPress: (movieId: number) => void;
  width?: number;
  showTitle?: boolean;
}

export default function MovieCard({ 
  movie, 
  onPress, 
  width = SIZES.movieCard.width,
  showTitle = true 
}: MovieCardProps) {
  const imageUrl = movie.poster_path 
    ? `${ENV_CONFIG.TMDB_IMAGE_BASE_URL}/${IMAGE_SIZES.poster.medium}${movie.poster_path}`
    : null;

  const cardHeight = width * 1.5; // Maintain aspect ratio

  return (
    <TouchableOpacity 
      style={[styles.container, { width }]} 
      onPress={() => onPress(movie.id)}
      activeOpacity={0.8}
    >
      <View style={[styles.imageContainer, { height: cardHeight }]}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholder, { height: cardHeight }]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        
        {/* Rating overlay */}
        {movie.vote_average > 0 && (
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>
              {movie.vote_average.toFixed(1)}
            </Text>
          </View>
        )}
      </View>
      
      {showTitle && (
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {movie.title}
          </Text>
          {movie.release_date && (
            <Text style={styles.year}>
              {new Date(movie.release_date).getFullYear()}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: SIZES.spacing.small,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: SIZES.movieCard.borderRadius,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  placeholderText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.font.small,
  },
  ratingContainer: {
    position: 'absolute',
    top: SIZES.spacing.small,
    right: SIZES.spacing.small,
    backgroundColor: COLORS.overlay,
    paddingHorizontal: SIZES.spacing.tiny,
    paddingVertical: 2,
    borderRadius: SIZES.radius.small,
  },
  rating: {
    color: COLORS.text,
    fontSize: SIZES.font.tiny,
    fontWeight: 'bold',
  },
  titleContainer: {
    marginTop: SIZES.spacing.small,
    paddingHorizontal: 2,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.font.small,
    fontWeight: '600',
    lineHeight: 16,
  },
  year: {
    color: COLORS.textSecondary,
    fontSize: SIZES.font.tiny,
    marginTop: 2,
  },
});