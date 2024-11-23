import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a custom error page component for service unavailability
const SERVICE_ERROR_PATH = '/service-unavailable';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase configuration is missing. Service will be unavailable.');
  
  // Only redirect if we're in a browser environment and not already on the error page
  if (typeof window !== 'undefined' && 
      window.location.pathname !== SERVICE_ERROR_PATH) {
    window.location.href = SERVICE_ERROR_PATH;
  }
}

export const supabase = createClient<Database>(
  supabaseUrl || '',  // Fallback empty string to prevent runtime errors
  supabaseKey || '',  // Fallback empty string to prevent runtime errors
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storage: localStorage,
      storageKey: 'video-gallery-auth-token',
      flowType: 'pkce'
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-application-name': 'video-gallery'
      }
    }
  }
);