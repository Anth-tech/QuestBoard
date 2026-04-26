"use client";
import { createClient } from "@/lib/client";

export default function LogoutButton() {
  // Initialize the Supabase client for browser use
  const supabase = createClient();

  // signs out and redirects to last window
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-blue-900 text-white rounded cursor-pointer"
    >
      Sign Out
    </button>
  );
}
