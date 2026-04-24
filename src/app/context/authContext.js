"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/client";

const supabase = createClient();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId) {
    if (!userId) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.warn("Profile fetch error:", error.message);
    }

    setProfile(data ?? null);
  }

  async function logout() {
    setLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.warn("Logout error:", error.message);
    }

    setUser(null);
    setProfile(null);
    setLoading(false);
  }

  useEffect(() => {
    let mounted = true;

    async function init() {
      setLoading(true);

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error) {
        console.warn("getUser error:", error.message);
      }

      const nextUser = user ?? null;

      setUser(nextUser);
      await loadProfile(nextUser?.id);

      if (mounted) setLoading(false);
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      setLoading(true);

      const nextUser = session?.user ?? null;

      setUser(nextUser);
      await loadProfile(nextUser?.id);

      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}