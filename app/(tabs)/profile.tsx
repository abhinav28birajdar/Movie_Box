/**
 * Profile Screen - User profile and settings
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { COLORS, LAYOUT, SIZES } from '../../constants/app';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading profile..." />;
  }

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const profileItems = [
    {
      icon: 'person-outline' as keyof typeof Ionicons.glyphMap,
      title: 'Edit Profile',
      subtitle: 'Update your profile information',
      onPress: handleEditProfile,
    },
    {
      icon: 'bookmark-outline' as keyof typeof Ionicons.glyphMap,
      title: 'My Watchlist',
      subtitle: 'View your saved movies',
      onPress: () => router.push('/watchlist'),
    },
    {
      icon: 'list-outline' as keyof typeof Ionicons.glyphMap,
      title: 'My Lists',
      subtitle: 'Manage your custom movie lists',
      onPress: () => router.push('/lists'),
    },
    {
      icon: 'settings-outline' as keyof typeof Ionicons.glyphMap,
      title: 'Settings',
      subtitle: 'App preferences and settings',
      onPress: () => Alert.alert('Coming Soon', 'Settings will be available in a future update'),
    },
    {
      icon: 'help-circle-outline' as keyof typeof Ionicons.glyphMap,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => Alert.alert('Coming Soon', 'Help & Support will be available in a future update'),
    },
    {
      icon: 'information-circle-outline' as keyof typeof Ionicons.glyphMap,
      title: 'About MovieBox',
      subtitle: 'App version and information',
      onPress: () => Alert.alert('MovieBox', 'Version 1.0.0\n\nYour ultimate movie companion app'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.profile?.avatar_url ? (
              <Image
                source={{ uri: user.profile.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={COLORS.textSecondary} />
              </View>
            )}
          </View>
          
          <Text style={styles.username}>
            {user?.profile?.username || 'MovieBox User'}
          </Text>
          
          {user?.email && (
            <Text style={styles.email}>{user.email}</Text>
          )}
          
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Menu */}
        <View style={styles.menuContainer}>
          {profileItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutContainer}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: LAYOUT.screenPadding,
    paddingTop: SIZES.spacing.xlarge,
  },
  avatarContainer: {
    marginBottom: SIZES.spacing.normal,
  },
  avatar: {
    width: SIZES.profileImage.large,
    height: SIZES.profileImage.large,
    borderRadius: SIZES.profileImage.large / 2,
  },
  avatarPlaceholder: {
    width: SIZES.profileImage.large,
    height: SIZES.profileImage.large,
    borderRadius: SIZES.profileImage.large / 2,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  username: {
    fontSize: SIZES.font.xxlarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.spacing.tiny,
  },
  email: {
    fontSize: SIZES.font.normal,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.normal,
  },
  editButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spacing.large,
    paddingVertical: SIZES.spacing.small,
    borderRadius: SIZES.radius.normal,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editButtonText: {
    fontSize: SIZES.font.normal,
    color: COLORS.primary,
    fontWeight: '600',
  },
  menuContainer: {
    marginTop: SIZES.spacing.large,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.screenPadding,
    paddingVertical: SIZES.spacing.normal,
    backgroundColor: COLORS.surface,
    marginBottom: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.normal,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: SIZES.font.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: SIZES.font.small,
    color: COLORS.textSecondary,
  },
  signOutContainer: {
    margin: LAYOUT.screenPadding,
    marginTop: SIZES.spacing.xlarge,
  },
  signOutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.normal,
    borderRadius: SIZES.radius.normal,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  signOutText: {
    fontSize: SIZES.font.medium,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: SIZES.spacing.small,
  },
});