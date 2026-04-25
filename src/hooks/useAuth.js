import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    // fetches profile data from profiles table
    const fetchProfile = async (user) => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();
      setProfile(data);
    };

    // fetches user data from auth.users
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchProfile(user);
    };

    getUser();

    // detects whenever the user's auth state changes (i.e. sign in/out), used to update sign in/out button and profile info in navbar
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user);
        else setProfile(null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName = profile?.display_name ?? user?.user_metadata?.full_name ?? "User";
  const initials = displayName.charAt(0).toUpperCase();

  return { user, profile, avatarUrl, displayName, initials };
}