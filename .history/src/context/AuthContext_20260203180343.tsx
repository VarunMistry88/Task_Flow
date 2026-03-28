
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { type User, type Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
    signInOffline: () => void;
    isOfflineMode: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
    signInOffline: () => { },
    isOfflineMode: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    useEffect(() => {
        const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!isSupabaseConfigured) {
            // If Supabase is not configured, go straight to offline mode
            setIsOfflineMode(true);
            setUser({ id: 'offline-user', email: 'offline@local' } as User);
            setLoading(false);
            return;
        }

        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.warn("Supabase connection failed, enabling offline mode:", error);
                setIsOfflineMode(true);
                setUser({ id: 'offline-user', email: 'offline@local' } as User);
            } else {
                setSession(session);
                setUser(session?.user ?? null);
            }
            setLoading(false);
        }).catch((error) => {
            console.warn("Supabase connection failed, enabling offline mode:", error);
            setIsOfflineMode(true);
            setUser({ id: 'offline-user', email: 'offline@local' } as User);
            setLoading(false);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!isOfflineMode) {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [isOfflineMode]);

    const signOut = async () => {
        if (isOfflineMode) {
            setUser(null);
            setIsOfflineMode(false);
        } else {
            await supabase.auth.signOut();
        }
    };

    const signInOffline = () => {
        setIsOfflineMode(true);
        setUser({ id: 'offline-user', email: 'offline@local' } as User);
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut, signInOffline, isOfflineMode }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
