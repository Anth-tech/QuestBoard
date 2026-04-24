"use client";
import { createClient } from "@/lib/client";

export default function LoginButton() {
  // Initialize the Supabase client for browser use
  const supabase = createClient();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button onClick={handleLogin} className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">
      Sign In with Google
    </button>
  );
}