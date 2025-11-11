/**
 * Loading Spinner Component
 */

import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { COLORS, SIZES } from '../../constants/app';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  message = 'Loading...',
  size = 'large',
  color = COLORS.primary,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const containerStyle = fullScreen 
    ? [styles.container, styles.fullScreen] 
    : styles.container;

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.medium,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  message: {
    marginTop: SIZES.spacing.small,
    fontSize: SIZES.font.normal,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});