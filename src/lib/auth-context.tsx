import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import type { Profile } from './supabase-types';
import { handleAuthError } from './auth-utils';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_CHECK_INTERVAL = 4 * 60 * 1000; // 4 minutes
const AUTH_STORAGE_KEY = 'video-gallery-auth-token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    isInitialized: false
  });

  const sessionCheckTimer = useRef<NodeJS.Timeout>();
  const mounted = useRef(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    if (!mounted.current) return;

    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to refresh session',
          isAuthenticated: false,
          user: null,
          profile: null,
          session: null
        }));
        navigate('/login', { 
          state: { message: 'Your session has expired. Please sign in again.' }
        });
        return;
      }

      if (session) {
        const profile = await fetchProfile(session.user.id);
        setState(prev => ({
          ...prev,
          session,
          user: session.user,
          profile,
          isAuthenticated: true,
          error: null
        }));
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      setState(prev => ({
        ...prev,
        error: handleAuthError(error),
        isAuthenticated: false,
        user: null,
        profile: null,
        session: null
      }));
      navigate('/login', { 
        state: { message: 'An error occurred. Please sign in again.' }
      });
    }
  }, [fetchProfile, navigate]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null,
            isAuthenticated: true,
            isInitialized: true
          });
        } else {
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            isInitialized: true 
          }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState(prev => ({ 
          ...prev, 
          error: handleAuthError(error),
          loading: false,
          isInitialized: true
        }));
      }
    };

    initializeAuth();

    // Set up session refresh interval
    sessionCheckTimer.current = setInterval(refreshSession, SESSION_CHECK_INTERVAL);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted.current) return;

      if (event === 'SIGNED_OUT' || !currentSession) {
        setState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          error: null,
          isAuthenticated: false,
          isInitialized: true
        });
        return;
      }

      if (currentSession?.user) {
        const profile = await fetchProfile(currentSession.user.id);
        setState({
          user: currentSession.user,
          profile,
          session: currentSession,
          loading: false,
          error: null,
          isAuthenticated: true,
          isInitialized: true
        });
      }
    });

    return () => {
      mounted.current = false;
      if (sessionCheckTimer.current) {
        clearInterval(sessionCheckTimer.current);
      }
      subscription.unsubscribe();
    };
  }, [fetchProfile, refreshSession]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: handleAuthError(error) };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: handleAuthError(error) };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (error) {
        return { success: false, error: handleAuthError(error) };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: handleAuthError(error) };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: handleAuthError(error) };
      }

      // Clear all auth-related data
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.clear();
      
      setState(prev => ({
        ...prev,
        user: null,
        profile: null,
        session: null,
        isAuthenticated: false,
        error: null
      }));

      navigate('/');
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: handleAuthError(error) };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!state.user) {
        return { success: false, error: 'No user logged in' };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: handleAuthError(error) };
      }

      setState(prev => ({ ...prev, profile: data }));
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: handleAuthError(error) };
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      signIn,
      signUp,
      signOut,
      updateProfile,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}