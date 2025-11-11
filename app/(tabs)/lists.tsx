/**
 * My Lists Screen - User's custom movie lists
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
import { COLORS, LAYOUT, SIZES } from '../../constants/app';
import databaseService from '../../services/databaseService';
import { MovieList } from '../../types';

export default function MyListsScreen() {
  const [lists, setLists] = useState<MovieList[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadLists();
    }, [])
  );

  const loadLists = async () => {
    try {
      setError(null);
      const data = await databaseService.getUserLists();
      setLists(data);
    } catch (err) {
      setError('Failed to load lists');
      console.error('Lists error:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLists();
    setRefreshing(false);
  };

  const handleCreateList = () => {
    router.push('/edit-list');
  };

  const handleListPress = (listId: string) => {
    router.push({
      pathname: '/list-detail',
      params: { listId },
    });
  };

  const handleEditList = (listId: string) => {
    router.push({
      pathname: '/edit-list',
      params: { listId },
    });
  };

  const handleDeleteList = (list: MovieList) => {
    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${list.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteList(list.id),
        },
      ]
    );
  };

  const deleteList = async (listId: string) => {
    try {
      await databaseService.deleteList(listId);
      setLists(prev => prev.filter(list => list.id !== listId));
    } catch (err) {
      Alert.alert('Error', 'Failed to delete list');
      console.error('Delete list error:', err);
    }
  };

  const renderListItem = ({ item }: { item: MovieList }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleListPress(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.listContent}>
        <View style={styles.listHeader}>
          <Text style={styles.listName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.listMeta}>
            <Ionicons
              name={item.is_public ? 'globe' : 'lock-closed'}
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={styles.movieCount}>
              {item.movies_count || 0} movie{(item.movies_count || 0) !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.listDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <Text style={styles.listDate}>
          Created {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.listActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditList(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="pencil" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteList(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner message="Loading your lists..." />;
    }

    if (error) {
      return (
        <EmptyState
          icon="alert-circle"
          title="Error Loading Lists"
          description={error}
          buttonText="Try Again"
          onButtonPress={loadLists}
        />
      );
    }

    if (lists.length === 0) {
      return (
        <EmptyState
          icon="list"
          title="No Lists Yet"
          description="Create custom lists to organize your favorite movies"
          buttonText="Create Your First List"
          onButtonPress={handleCreateList}
        />
      );
    }

    return (
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={renderListItem}
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
        <Text style={styles.headerTitle}>My Lists</Text>
        {lists.length > 0 && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateList}
          >
            <Ionicons name="add" size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
      </View>

      {renderContent()}

      {/* Floating Action Button for empty state */}
      {lists.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateList}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={COLORS.text} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.screenPadding,
    paddingTop: SIZES.spacing.large,
    paddingBottom: SIZES.spacing.normal,
  },
  headerTitle: {
    fontSize: SIZES.font.xxxlarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  createButton: {
    padding: SIZES.spacing.small,
  },
  listContainer: {
    padding: LAYOUT.screenPadding,
    paddingTop: 0,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.normal,
    padding: SIZES.spacing.normal,
    marginBottom: SIZES.spacing.normal,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  listContent: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.small,
  },
  listName: {
    fontSize: SIZES.font.large,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: SIZES.spacing.small,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  movieCount: {
    fontSize: SIZES.font.small,
    color: COLORS.textSecondary,
    marginLeft: SIZES.spacing.tiny,
  },
  listDescription: {
    fontSize: SIZES.font.normal,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.small,
    lineHeight: 18,
  },
  listDate: {
    fontSize: SIZES.font.small,
    color: COLORS.textSecondary,
  },
  listActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: SIZES.spacing.small,
    marginLeft: SIZES.spacing.small,
  },
  fab: {
    position: 'absolute',
    right: LAYOUT.screenPadding,
    bottom: LAYOUT.screenPadding,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});