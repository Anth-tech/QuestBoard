"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NavBar({ projectName = "Project A1" }) {
  const [user, setUser] = useState(null);

  // Get current session on load
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    };

    getUser();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Google login (FIXED for deployment safety)
  const signInWithGoogle = async () => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  };

  // Logout
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <aside style={styles.sidebar}>
      {/* Top Section */}
      <div>
        <h2 style={styles.logo}>QuestBoard</h2>

        <div style={styles.projectBox}>
          <span style={styles.projectLabel}>Current Project</span>
          <h3 style={styles.projectName}>{projectName}</h3>
        </div>

        <nav style={styles.nav}>
          <Link href="/charter" style={styles.link}>
            Project Charter
          </Link>
          <Link href="/tasks" style={styles.link}>
            Tasks
          </Link>
          <Link href="/discussions" style={styles.link}>
            Discussion Boards
          </Link>
        </nav>
      </div>

      {/* Bottom Section */}
      <div style={styles.bottomSection}>
        {user ? (
          <div
            onClick={signOut}
            style={{ ...styles.profile, cursor: "pointer" }}
          >
            <div style={styles.avatar}>
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <span>Sign out</span>
          </div>
        ) : (
          <button onClick={signInWithGoogle} style={styles.loginButton}>
            Sign in with Google
          </button>
        )}

        <Link href="/settings" style={styles.link}>
          ⚙️ Settings
        </Link>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "250px",
    height: "100vh",
    backgroundColor: "#111827",
    color: "white",
    padding: "20px",
    position: "fixed",
    left: 0,
    top: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  logo: {
    marginBottom: "20px",
    fontSize: "20px",
    fontWeight: "bold",
  },

  projectBox: {
    marginBottom: "25px",
    padding: "10px",
    backgroundColor: "#1f2937",
    borderRadius: "8px",
  },

  projectLabel: {
    fontSize: "12px",
    color: "#9ca3af",
  },

  projectName: {
    margin: 0,
    fontSize: "16px",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  link: {
    color: "#d1d5db",
    textDecoration: "none",
    fontSize: "16px",
  },

  bottomSection: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    borderTop: "1px solid #374151",
    paddingTop: "15px",
  },

  profile: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  avatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    backgroundColor: "#4b5563",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },

  loginButton: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
};