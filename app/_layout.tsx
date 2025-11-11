import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

import AuthStack from '../components/navigation/AuthStack';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading MovieBox..." />;
  }

  if (!user) {
    return <AuthStack />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="movie-detail" 
        options={{ 
          presentation: 'modal',
          headerShown: true,
          title: 'Movie Details'
        }} 
      />
      <Stack.Screen 
        name="person-detail" 
        options={{ 
          presentation: 'modal',
          headerShown: true,
          title: 'Person Details'
        }} 
      />
      <Stack.Screen 
        name="list-detail" 
        options={{ 
          presentation: 'modal',
          headerShown: true,
          title: 'List Details'
        }} 
      />
      <Stack.Screen 
        name="edit-list" 
        options={{ 
          presentation: 'modal',
          headerShown: true,
          title: 'Edit List'
        }} 
      />
      <Stack.Screen 
        name="edit-profile" 
        options={{ 
          presentation: 'modal',
          headerShown: true,
          title: 'Edit Profile'
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
      <StatusBar style="light" backgroundColor="#000000" />
    </AuthProvider>
  );
}
