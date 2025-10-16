import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AuthService, { User, UserPreferences } from '../../services/authService';
import SavedMoviesService from '../../services/savedMoviesService';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  });
  const [preferences, setPreferences] = useState<UserPreferences>({
    favoriteGenres: [],
    watchQuality: 'auto' as 'auto' | '480p' | '720p' | '1080p' | '4K',
    autoPlay: true,
    showAdultContent: false,
    language: 'en',
    notifications: true
  });

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      if (!AuthService.isAuthenticated()) {
        router.replace('./auth/signin');
        return;
      }

      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setEditForm({
          name: currentUser.name,
          email: currentUser.email
        });
        setPreferences(currentUser.preferences);
        
        // Load user stats
        const userStats = await SavedMoviesService.getStats();
        setStats(userStats);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const result = await AuthService.updateProfile({
        name: editForm.name,
        email: editForm.email
      });

      if (result.success) {
        setUser(prev => prev ? { ...prev, name: editForm.name, email: editForm.email } : null);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      const result = await AuthService.updatePreferences(preferences);
      if (result.success) {
        Alert.alert('Success', 'Preferences updated successfully');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update preferences');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AuthService.logout();
            router.replace('./auth/signin');
          }
        }
      ]
    );
  };

  const clearWatchHistory = () => {
    Alert.alert(
      'Clear Watch History',
      'This will permanently delete your watch history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const success = await SavedMoviesService.clearWatchHistory();
            if (success) {
              Alert.alert('Success', 'Watch history cleared successfully');
              checkAuthAndLoadData(); // Refresh data
            } else {
              Alert.alert('Error', 'Failed to clear watch history');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-black justify-center items-center px-6">
        <Ionicons name="person-circle" size={100} color="#6B7280" />
        <Text className="text-white text-xl font-bold mt-4 mb-2">Not Signed In</Text>
        <Text className="text-gray-400 text-center mb-6">
          Sign in to access your profile, saved movies, and preferences
        </Text>
        <TouchableOpacity 
          className="bg-blue-600 px-6 py-3 rounded-lg"
          onPress={() => router.push('./auth/signin')}
        >
          <Text className="text-white font-semibold">Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-black">
      {/* Header */}
      <View className="px-6 pt-12 pb-6">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-white text-2xl font-bold">Profile</Text>
          <TouchableOpacity 
            onPress={() => setIsEditing(!isEditing)}
            className="bg-gray-800 px-4 py-2 rounded-lg"
          >
            <Text className="text-white">
              {isEditing ? 'Cancel' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View className="bg-gray-900 rounded-xl p-6 mb-6">
          <View className="items-center mb-6">
            <View className="bg-blue-600 rounded-full w-20 h-20 justify-center items-center mb-4">
              <Text className="text-white text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            
            {isEditing ? (
              <View className="w-full space-y-4">
                <View>
                  <Text className="text-white text-sm font-medium mb-2">Name</Text>
                  <TextInput
                    className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700"
                    value={editForm.name}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                    placeholder="Enter your name"
                    placeholderTextColor="#6B7280"
                  />
                </View>
                <View>
                  <Text className="text-white text-sm font-medium mb-2">Email</Text>
                  <TextInput
                    className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700"
                    value={editForm.email}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
                    placeholder="Enter your email"
                    placeholderTextColor="#6B7280"
                    keyboardType="email-address"
                  />
                </View>
                <TouchableOpacity
                  className="bg-blue-600 py-3 rounded-lg"
                  onPress={handleSaveProfile}
                >
                  <Text className="text-white text-center font-semibold">Save Changes</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="items-center">
                <Text className="text-white text-xl font-bold mb-1">{user.name}</Text>
                <Text className="text-gray-400 mb-2">{user.email}</Text>
                <Text className="text-gray-500 text-sm">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Stats */}
      {stats && (
        <View className="px-6 mb-6">
          <Text className="text-white text-xl font-bold mb-4">Your Stats</Text>
          <View className="bg-gray-900 rounded-xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">{stats.totalSaved}</Text>
                <Text className="text-gray-400 text-sm">Saved Movies</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">{stats.watched}</Text>
                <Text className="text-gray-400 text-sm">Watched</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">{stats.totalWatchTime}h</Text>
                <Text className="text-gray-400 text-sm">Watch Time</Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center">
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">{stats.favorites}</Text>
                <Text className="text-gray-400 text-sm">Favorites</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">{stats.watchlist}</Text>
                <Text className="text-gray-400 text-sm">Watchlist</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">{stats.averageRating}</Text>
                <Text className="text-gray-400 text-sm">Avg Rating</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Preferences */}
      <View className="px-6 mb-6">
        <Text className="text-white text-xl font-bold mb-4">Preferences</Text>
        <View className="bg-gray-900 rounded-xl p-6 space-y-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-white">Auto Play</Text>
            <Switch
              value={preferences.autoPlay}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, autoPlay: value }))}
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor={preferences.autoPlay ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-white">Notifications</Text>
            <Switch
              value={preferences.notifications}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, notifications: value }))}
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor={preferences.notifications ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-white">Show Adult Content</Text>
            <Switch
              value={preferences.showAdultContent}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, showAdultContent: value }))}
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor={preferences.showAdultContent ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View>
            <Text className="text-white mb-2">Video Quality</Text>
            <View className="flex-row flex-wrap">
              {['auto', '480p', '720p', '1080p', '4K'].map((quality) => (
                <TouchableOpacity
                  key={quality}
                  className={`mr-2 mb-2 px-3 py-2 rounded-lg ${
                    preferences.watchQuality === quality ? 'bg-blue-600' : 'bg-gray-800'
                  }`}
                  onPress={() => setPreferences(prev => ({ 
                    ...prev, 
                    watchQuality: quality as 'auto' | '480p' | '720p' | '1080p' | '4K'
                  }))}
                >
                  <Text className="text-white text-sm">{quality}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            className="bg-blue-600 py-3 rounded-lg mt-4"
            onPress={handleSavePreferences}
          >
            <Text className="text-white text-center font-semibold">Save Preferences</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-6 mb-6">
        <Text className="text-white text-xl font-bold mb-4">Quick Actions</Text>
        <View className="space-y-3">
          <TouchableOpacity 
            className="bg-gray-900 p-4 rounded-xl flex-row items-center justify-between"
            onPress={() => router.push('./saved')}
          >
            <View className="flex-row items-center">
              <Ionicons name="heart" size={24} color="#EF4444" />
              <Text className="text-white ml-3 text-lg">My Saved Movies</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-gray-900 p-4 rounded-xl flex-row items-center justify-between"
            onPress={clearWatchHistory}
          >
            <View className="flex-row items-center">
              <Ionicons name="time" size={24} color="#F59E0B" />
              <Text className="text-white ml-3 text-lg">Clear Watch History</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-gray-900 p-4 rounded-xl flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name="settings" size={24} color="#8B5CF6" />
              <Text className="text-white ml-3 text-lg">App Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-gray-900 p-4 rounded-xl flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name="help-circle" size={24} color="#10B981" />
              <Text className="text-white ml-3 text-lg">Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout */}
      <View className="px-6 pb-6">
        <TouchableOpacity 
          className="bg-red-600 p-4 rounded-xl flex-row items-center justify-center"
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={24} color="white" />
          <Text className="text-white ml-3 text-lg font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}