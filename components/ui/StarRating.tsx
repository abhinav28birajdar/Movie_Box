/**
 * Star Rating Component for Movie Reviews
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/app';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
  maxStars?: number;
}

export default function StarRating({
  rating,
  onRatingChange,
  size = 24,
  readonly = false,
  maxStars = 5,
}: StarRatingProps) {
  const handleStarPress = (starNumber: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starNumber);
    }
  };

  const renderStar = (starNumber: number) => {
    const isFilled = starNumber <= rating;
    const isHalfFilled = starNumber - 0.5 === rating;
    
    let iconName: keyof typeof Ionicons.glyphMap;
    if (isFilled) {
      iconName = 'star';
    } else if (isHalfFilled) {
      iconName = 'star-half';
    } else {
      iconName = 'star-outline';
    }

    const StarComponent = readonly ? View : TouchableOpacity;

    return (
      <StarComponent
        key={starNumber}
        style={styles.star}
        onPress={() => handleStarPress(starNumber)}
        disabled={readonly}
      >
        <Ionicons
          name={iconName}
          size={size}
          color={isFilled || isHalfFilled ? COLORS.accent : COLORS.textSecondary}
        />
      </StarComponent>
    );
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: maxStars }, (_, index) => renderStar(index + 1))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 2,
  },
});