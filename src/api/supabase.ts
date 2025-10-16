import 'react-native-url-polyfill/auto'; // Polyfill for URL API
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a single supabase client for your application
export const supabase = createClient(
  SUPABASE_URL!, 
  SUPABASE_ANON_KEY!, 
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);