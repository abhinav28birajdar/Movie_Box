import { supabase, Profile } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  private static instance: AuthService;
  private currentUser: any = null;
  private currentProfile: Profile | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Sign up with email and password
  async signUp(email: string, password: string, userData?: { full_name?: string }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData || {}
        }
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        this.currentUser = data.user;
        await this.loadUserProfile();
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      this.currentUser = null;
      this.currentProfile = null;
      await AsyncStorage.clear();

      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'moviebox://reset-password',
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error };
    }
  }

  // Update password
  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { error };
    }
  }

  // Get current session
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (session?.user) {
        this.currentUser = session.user;
        await this.loadUserProfile();
      }

      return { session, error: null };
    } catch (error) {
      console.error('Get session error:', error);
      return { session: null, error };
    }
  }

  // Load user profile
  async loadUserProfile() {
    if (!this.currentUser) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.currentUser.id)
        .single();

      if (error) throw error;

      this.currentProfile = data;
      return data;
    } catch (error) {
      console.error('Load profile error:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<Profile>) {
    if (!this.currentUser) throw new Error('No authenticated user');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', this.currentUser.id)
        .select()
        .single();

      if (error) throw error;

      this.currentProfile = data;
      return { data, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { data: null, error };
    }
  }

  // Upload avatar
  async uploadAvatar(uri: string) {
    if (!this.currentUser) throw new Error('No authenticated user');

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const fileExt = uri.split('.').pop();
      const fileName = `${this.currentUser.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      await this.updateProfile({ avatar_url: publicUrl });

      return { url: publicUrl, error: null };
    } catch (error) {
      console.error('Upload avatar error:', error);
      return { url: null, error };
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get current profile
  getCurrentProfile() {
    return this.currentProfile;
  }

  // Set up auth state listener
  setupAuthListener(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser = session?.user || null;
      if (session?.user) {
        this.loadUserProfile();
      } else {
        this.currentProfile = null;
      }
      callback(session?.user || null);
    });
  }

  // Verify email
  async verifyEmail(token: string, email: string) {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Verify email error:', error);
      return { error };
    }
  }

  // Resend email verification
  async resendEmailVerification(email: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { error };
    }
  }
}

export default AuthService.getInstance();