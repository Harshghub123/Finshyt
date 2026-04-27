import { create } from 'zustand';
import supabase, { isSupabaseConfigured } from '../lib/supabase';

const useAuth = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  initialize: async () => {
    if (!isSupabaseConfigured()) {
      console.log('[auth] Supabase not configured');
      set({ loading: false, user: null });
      return;
    }

    try {
      // Listener handles all subsequent auth changes (incl. OAuth redirect).
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('[auth] state change:', event, session?.user?.email || 'no user');
        set({ user: session?.user || null, loading: false });
      });

      // Also do an explicit getSession() as a fallback to guarantee
      // loading turns off even if INITIAL_SESSION doesn't fire.
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('[auth] getSession:', session?.user?.email || 'no session', error || '');
      set({ user: session?.user || null, loading: false });
    } catch (e) {
      console.error('[auth] init failed:', e);
      set({ loading: false });
    }
  },

  signUp: async (email, password) => {
    set({ error: null });
    if (!isSupabaseConfigured()) return { error: 'Supabase not configured' };

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) set({ error: error.message });
    return { data, error };
  },

  signIn: async (email, password) => {
    set({ error: null });
    if (!isSupabaseConfigured()) return { error: 'Supabase not configured' };

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) set({ error: error.message });
    else set({ user: data.user });
    return { data, error };
  },

  signInWithGoogle: async () => {
    set({ error: null });
    if (!isSupabaseConfigured()) {
      set({ error: 'Supabase not configured' });
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        // Handle provider not enabled
        if (error.message?.includes('provider') || error.message?.includes('Unsupported')) {
          set({ error: 'Google login is not enabled yet. Go to Supabase → Authentication → Providers → Enable Google. For now, use email/password or demo mode.' });
        } else {
          set({ error: error.message });
        }
      }
    } catch (err) {
      set({ error: 'Google login failed. Use email/password or demo mode instead.' });
    }
  },

  signOut: async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    set({ user: null });
  },

  loginDemo: () => {
    set({
      user: {
        id: 'demo-user',
        email: 'demo@finshyt.app',
      },
      error: null,
    });
  },

  logoutDemo: () => set({ user: null }),

  clearError: () => set({ error: null }),

  isDemoMode: () => {
    const { user } = get();
    return user?.id === 'demo-user';
  },
}));

export default useAuth;
