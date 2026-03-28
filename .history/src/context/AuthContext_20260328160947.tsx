
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
// import { type User, type Session } from '@supabase/supabase-js';
// import { supabase } from '../lib/supabase';

// Simple offline user type
type User = {
    id: string;
    email: string;
};

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isOfflineMode: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: false,
    isOfflineMode: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Always use offline mode with a default user
    const [user] = useState<User>({ id: 'offline-user', email: 'offline@local' });
    const [loading] = useState(false);
    const [isOfflineMode] = useState(true);

    // Supabase authentication code commented out for offline-only mode
    // useEffect(() => {
    //     const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    //     
    //     if (!isSupabaseConfigured) {
    //         setIsOfflineMode(true);
    //         setUser({ id: 'offline-user', email: 'offline@local' } as User);
    //         setLoading(false);
    //         return;
    //     }
    //
    //     supabase.auth.getSession().then(({ data: { session }, error }: any) => {
    //         if (error) {
    //             console.warn("Supabase connection failed, enabling offline mode:", error);
    //             setIsOfflineMode(true);
    //             setUser({ id: 'offline-user', email: 'offline@local' } as User);
    //         } else {
    //             setSession(session);
    //             setUser(session?.user ?? null);
    //         }
    //         setLoading(false);
    //     }).catch((error: any) => {
    //         console.warn("Supabase connection failed, enabling offline mode:", error);
    //         setIsOfflineMode(true);
    //         setUser({ id: 'offline-user', email: 'offline@local' } as User);
    //         setLoading(false);
    //     });
    //
    //     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
    //         if (!isOfflineMode) {
    //             setSession(session);
    //             setUser(session?.user ?? null);
    //             setLoading(false);
    //         }
    //     });
    //
    //     return () => subscription.unsubscribe();
    // }, [isOfflineMode]);

    return (
        <AuthContext.Provider value={{ user, loading, isOfflineMode }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
