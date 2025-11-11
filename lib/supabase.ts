/**
 * Supabase client configuration
 */

import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { ENV_CONFIG } from '../constants/env';

// Initialize Supabase client
export const supabase = createClient(
  ENV_CONFIG.SUPABASE_URL,
  ENV_CONFIG.SUPABASE_ANON_KEY,
  {
    auth: {
      // Persist auth session in storage
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);