import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/App/HomeScreen';
import SearchScreen from '../screens/App/SearchScreen';
import WatchlistScreen from '../screens/App/WatchlistScreen';
import ProfileScreen from '../screens/App/ProfileScreen';
import MovieDetailScreen from '../screens/App/MovieDetailScreen';

// Type definitions for navigation params
export type MovieStackParamList = {
  HomeList: undefined;
  MovieDetail: { movieId: number; movieTitle: string };
};
export type SearchStackParamList = {
  SearchList: undefined;
  MovieDetail: { movieId: number; movieTitle: string };
};
export type WatchlistStackParamList = {
  WatchlistList: undefined;
  MovieDetail: { movieId: number; movieTitle: string };
};

const HomeStack = createNativeStackNavigator<MovieStackParamList>();
const SearchStack = createNativeStackNavigator<SearchStackParamList>();
const WatchlistStack = createNativeStackNavigator<WatchlistStackParamList>();
const Tab = createBottomTabNavigator();

const HomeStackScreen: React.FC = () => (
  <HomeStack.Navigator screenOptions={{ 
    headerStyle: { backgroundColor: '#030014' }, 
    headerTintColor: '#fff',
    contentStyle: { backgroundColor: '#030014' }
  }}>
    <HomeStack.Screen name="HomeList" component={HomeScreen} options={{ title: 'Popular Movies' }} />
    <HomeStack.Screen name="MovieDetail" component={MovieDetailScreen} options={({ route }) => ({ title: route.params.movieTitle })} />
  </HomeStack.Navigator>
);

const SearchStackScreen: React.FC = () => (
  <SearchStack.Navigator screenOptions={{ 
    headerStyle: { backgroundColor: '#030014' }, 
    headerTintColor: '#fff',
    contentStyle: { backgroundColor: '#030014' }
  }}>
    <SearchStack.Screen name="SearchList" component={SearchScreen} options={{ title: 'Search Movies' }} />
    <SearchStack.Screen name="MovieDetail" component={MovieDetailScreen} options={({ route }) => ({ title: route.params.movieTitle })} />
  </SearchStack.Navigator>
);

const WatchlistStackScreen: React.FC = () => (
  <WatchlistStack.Navigator screenOptions={{ 
    headerStyle: { backgroundColor: '#030014' }, 
    headerTintColor: '#fff',
    contentStyle: { backgroundColor: '#030014' }
  }}>
    <WatchlistStack.Screen name="WatchlistList" component={WatchlistScreen} options={{ title: 'My Watchlist' }} />
    <WatchlistStack.Screen name="MovieDetail" component={MovieDetailScreen} options={({ route }) => ({ title: route.params.movieTitle })} />
  </WatchlistStack.Navigator>
);

const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Watchlist') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-circle-outline'; // Default or fallback icon
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#AB8BFF',
        tabBarInactiveTintColor: '#9CA4AB',
        headerShown: false, // Hide header for tab navigator itself
        tabBarStyle: { 
          backgroundColor: '#0F0D23',
          borderTopWidth: 0
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Search" component={SearchStackScreen} />
      <Tab.Screen name="Watchlist" component={WatchlistStackScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;