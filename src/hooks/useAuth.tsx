
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  is_adult: boolean;
  pin_code?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profiles: Profile[];
  selectedProfile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  setSelectedProfile: (profile: Profile | null) => void;
  refreshProfiles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profiles: [],
  selectedProfile: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  setSelectedProfile: () => {},
  refreshProfiles: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfileState] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && event !== 'SIGNED_OUT') {
          // Use setTimeout to defer Supabase calls and avoid potential conflicts
          setTimeout(() => {
            if (mounted) {
              fetchProfiles(session.user.id);
            }
          }, 100);
        } else {
          setProfiles([]);
          setSelectedProfileState(null);
          localStorage.removeItem('luxTV_selectedProfile');
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (!mounted) return;

        console.log('Initial session:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfiles(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load selected profile from localStorage when profiles change
  useEffect(() => {
    const savedProfileId = localStorage.getItem('luxTV_selectedProfile');
    if (savedProfileId && profiles.length > 0) {
      const savedProfile = profiles.find(p => p.id === savedProfileId);
      if (savedProfile) {
        setSelectedProfileState(savedProfile);
      }
    }
  }, [profiles]);

  const fetchProfiles = async (userId: string) => {
    try {
      console.log('Fetching profiles for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }
      
      console.log('Profiles fetched:', data?.length || 0);
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfiles = async () => {
    if (user) {
      setLoading(true);
      await fetchProfiles(user.id);
    }
  };

  const setSelectedProfile = (profile: Profile | null) => {
    setSelectedProfileState(profile);
    if (profile) {
      localStorage.setItem('luxTV_selectedProfile', profile.id);
    } else {
      localStorage.removeItem('luxTV_selectedProfile');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
      } else {
        console.log('Sign in successful:', data.user?.email);
      }
      
      return { error };
    } catch (error) {
      console.error('Sign in exception:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign up:', email);
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
      } else {
        console.log('Sign up successful:', data.user?.email);
      }
      
      return { error };
    } catch (error) {
      console.error('Sign up exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out');
      await supabase.auth.signOut();
      setSelectedProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    profiles,
    selectedProfile,
    loading,
    signIn,
    signUp,
    signOut,
    setSelectedProfile,
    refreshProfiles,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
