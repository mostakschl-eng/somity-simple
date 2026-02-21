import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getMyRole } from '@/lib/api';
import type { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  role: 'super_admin' | 'member' | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'super_admin' | 'member' | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setRole(null);
      setLoading(false);
      return;
    }
    try {
      const r = await getMyRole();
      setRole(r);
    } catch {
      setRole(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // First get session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      fetchRole(currentUser);
    }).catch(() => {
      setLoading(false);
    });

    // Then listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      // Use setTimeout to avoid deadlock with Supabase auth internals
      setTimeout(() => fetchRole(currentUser), 0);
    });

    return () => subscription.unsubscribe();
  }, [fetchRole]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
