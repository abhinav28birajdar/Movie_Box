/**
 * Empty State Component
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS, SIZES } from '../../constants/app';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

export default function EmptyState({
  icon = 'film-outline',
  title,
  description,
  buttonText,
  onButtonPress,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons 
        name={icon} 
        size={80} 
        color={COLORS.textSecondary} 
        style={styles.icon}
      />
      
      <Text style={styles.title}>{title}</Text>
      
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
      
      {buttonText && onButtonPress && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={onButtonPress}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.xlarge,
  },
  icon: {
    marginBottom: SIZES.spacing.medium,
  },
  title: {
    fontSize: SIZES.font.large,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.spacing.small,
  },
  description: {
    fontSize: SIZES.font.normal,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SIZES.spacing.large,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.spacing.large,
    paddingVertical: SIZES.spacing.normal,
    borderRadius: SIZES.radius.normal,
  },
  buttonText: {
    fontSize: SIZES.font.medium,
    fontWeight: '600',
    color: COLORS.text,
  },
});