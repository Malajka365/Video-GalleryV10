import { AuthError } from '@supabase/supabase-js';

export function handleAuthError(error: unknown): string {
  if (error instanceof AuthError) {
    switch (error.status) {
      case 400:
        if (error.message.includes('credentials')) {
          return 'invalid_credentials';
        }
        if (error.message.includes('refresh_token')) {
          return 'session_expired';
        }
        return error.message;
      case 422:
        return 'invalid_email';
      case 429:
        return 'too_many_attempts';
      default:
        return error.message;
    }
  }
  
  if (error instanceof Error) {
    if (error.message.includes('network')) {
      return 'network_error';
    }
    return error.message;
  }
  
  return 'unknown_error';
}

export function isSessionExpired(expiresAt: number | undefined): boolean {
  if (!expiresAt) return true;
  const now = Math.floor(Date.now() / 1000);
  return now >= expiresAt;
}

export function getTimeUntilExpiry(expiresAt: number | undefined): number {
  if (!expiresAt) return 0;
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, expiresAt - now);
}