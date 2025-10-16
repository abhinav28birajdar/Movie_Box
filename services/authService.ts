import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  favoriteGenres: number[];
  watchQuality: 'auto' | '480p' | '720p' | '1080p' | '4K';
  autoPlay: boolean;
  showAdultContent: boolean;
  language: string;
  notifications: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  USER_PREFERENCES: 'user_preferences',
  SAVED_MOVIES: 'saved_movies',
  WATCH_HISTORY: 'watch_history',
  CONTINUE_WATCHING: 'continue_watching'
};

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null
  };

  private constructor() {
    this.initializeAuth();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async initializeAuth() {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (token && userData) {
        this.authState = {
          isAuthenticated: true,
          user: JSON.parse(userData),
          token
        };
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  public async register(credentials: RegisterCredentials): Promise<{ success: boolean; message: string }> {
    try {
      // Validate credentials
      if (credentials.password !== credentials.confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }

      if (credentials.password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters' };
      }

      if (!this.isValidEmail(credentials.email)) {
        return { success: false, message: 'Please enter a valid email address' };
      }

      // Check if user already exists
      const existingUsers = await this.getStoredUsers();
      if (existingUsers.find(user => user.email === credentials.email)) {
        return { success: false, message: 'User with this email already exists' };
      }

      // Create new user
      const newUser: User = {
        id: this.generateUUID(),
        email: credentials.email,
        name: credentials.name,
        createdAt: new Date().toISOString(),
        preferences: {
          favoriteGenres: [],
          watchQuality: 'auto',
          autoPlay: true,
          showAdultContent: false,
          language: 'en',
          notifications: true
        }
      };

      // Generate token
      const token = this.generateToken();

      // Store user data
      await this.storeUserData(newUser, token, credentials.password);
      
      this.authState = {
        isAuthenticated: true,
        user: newUser,
        token
      };

      return { success: true, message: 'Account created successfully' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Failed to create account. Please try again.' };
    }
  }

  public async login(credentials: LoginCredentials): Promise<{ success: boolean; message: string }> {
    try {
      const existingUsers = await this.getStoredUsers();
      const user = existingUsers.find(u => u.email === credentials.email);
      
      if (!user) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Verify password (in real app, use proper hashing)
      const storedPassword = await SecureStore.getItemAsync(`password_${user.id}`);
      if (storedPassword !== credentials.password) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Generate new token
      const token = this.generateToken();
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);

      this.authState = {
        isAuthenticated: true,
        user,
        token
      };

      return { success: true, message: 'Login successful' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  }

  public async logout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      this.authState = {
        isAuthenticated: false,
        user: null,
        token: null
      };
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  public async updateProfile(updates: Partial<User>): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.authState.user) {
        return { success: false, message: 'Not authenticated' };
      }

      const updatedUser = { ...this.authState.user, ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      
      this.authState.user = updatedUser;
      
      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: 'Failed to update profile' };
    }
  }

  public async updatePreferences(preferences: Partial<UserPreferences>): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.authState.user) {
        return { success: false, message: 'Not authenticated' };
      }

      const updatedPreferences = { ...this.authState.user.preferences, ...preferences };
      const updatedUser = { ...this.authState.user, preferences: updatedPreferences };
      
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      this.authState.user = updatedUser;
      
      return { success: true, message: 'Preferences updated successfully' };
    } catch (error) {
      console.error('Preferences update error:', error);
      return { success: false, message: 'Failed to update preferences' };
    }
  }

  public getAuthState(): AuthState {
    return this.authState;
  }

  public getCurrentUser(): User | null {
    return this.authState.user;
  }

  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  private async storeUserData(user: User, token: string, password: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token),
      SecureStore.setItemAsync(`password_${user.id}`, password),
      AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
      this.updateStoredUsers(user)
    ]);
  }

  private async getStoredUsers(): Promise<User[]> {
    try {
      const users = await AsyncStorage.getItem('all_users');
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error getting stored users:', error);
      return [];
    }
  }

  private async updateStoredUsers(newUser: User): Promise<void> {
    try {
      const existingUsers = await this.getStoredUsers();
      const updatedUsers = [...existingUsers, newUser];
      await AsyncStorage.setItem('all_users', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Error updating stored users:', error);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private generateUUID(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateToken(): string {
    return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 12);
  }
}

export default AuthService.getInstance();