/**
 * Section Header Component for Lists
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

interface SectionHeaderProps {
  title: string;
  showViewAll?: boolean;
  onViewAllPress?: () => void;
}

export default function SectionHeader({
  title,
  showViewAll = false,
  onViewAllPress,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {showViewAll && onViewAllPress && (
        <TouchableOpacity 
          style={styles.viewAllButton} 
          onPress={onViewAllPress}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={COLORS.primary} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.normal,
    paddingVertical: SIZES.spacing.small,
  },
  title: {
    fontSize: SIZES.font.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: SIZES.font.normal,
    color: COLORS.primary,
    marginRight: 4,
  },
});