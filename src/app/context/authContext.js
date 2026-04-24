"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId) {
    if (!userId) {
      setProfile(null);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", userId)
      .single();

    setProfile(data ?? null);
  }

  useEffect(() => {
    let mounted = true;

    async function init() {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!mounted) return;

      setUser(user ?? null);
      await loadProfile(user?.id);

      if (mounted) setLoading(false);
    }

    init();

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (_event, session) => {
        const nextUser = session?.user ?? null;

        setUser(nextUser);
        await loadProfile(nextUser?.id);

        setLoading(false);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}