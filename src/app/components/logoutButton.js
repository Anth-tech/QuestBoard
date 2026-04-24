"use client";

import { useAuth } from "@/context/AuthContext";

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className="px-4 py-2 bg-blue-900 text-white rounded cursor-pointer"
    >
      Sign Out
    </button>
  );
}