"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // fetch user and profile
  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", user.id)
          .single();

        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("Auth fetch error:", err);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (_event, session) => {
        const user = session?.user ?? null;
        setUser(user);

        if (user) {
          try {
            const { data } = await supabase
              .from("profiles")
              .select("display_name, avatar_url")
              .eq("id", user.id)
              .single();

            setProfile(data);
          } catch (err) {
            console.error("Profile fetch error:", err);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }

        setLoading(false);
      });

    return () => subscription.unsubscribe();
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