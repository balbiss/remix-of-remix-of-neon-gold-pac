import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  full_name: string;
  cpf: string;
  balance: number;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName: string, cpf: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    console.log('Fetching profile for:', userId);
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
    );

    try {
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Race the profile fetch against the timeout
      const { data, error } = (await Promise.race([profilePromise, timeoutPromise])) as any;

      if (error) {
        console.warn('Profile fetch returned error:', error.message);
        setProfile(null);
      } else if (data) {
        console.log('Profile fetched successfully:', data);
        setProfile(data);
      }
    } catch (err: any) {
      console.error('fetchProfile error:', err.message || err);
      // Ensure we don't leave profile as undefined if it fails
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      console.log('Initializing Auth...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!mounted) return;

        console.log('Initial session check:', session ? 'User logged in' : 'No user');
        setSession(session);
        setUser(session?.user ?? null);
        
        // Start profile fetch but DON'T await it if we want to clear loading fast
        if (session?.user) {
          fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error during auth init:', error);
      } finally {
        if (mounted) {
          console.log('Auth init path complete, clearing loading state');
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth change event:', event, session?.user?.id);
      
      if (!mounted) return;

      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      
      // Ensure loading is false on any auth change that might happen during startup
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, fullName: string, cpf: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          cpf: cpf,
        },
      },
    });

    if (error) return { error };

    // After signup, manually create profile if needed (though we should have a trigger)
    // For safety, let's assume a trigger exists or create it here if wanted.
    return { data, error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    profile,
    loading,
    refreshProfile,
    signOut,
    signIn,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
