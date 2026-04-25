"use client";
import { createClient } from "@/lib/client";

export default function LoginButton() {
  const supabase = createClient();

  // attempts to sign in using google
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  return (
    <button onClick={handleLogin} className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer">
      Sign In with Google
    </button>
  );
}