"use client";

import Link from "next/link";
import LoginButton from "./loginButton";
import LogoutButton from "./logoutButton";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client.js";
import { useParams } from "next/navigation";

export default function NavBar() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const supabase = createClient();

  const params = useParams();
  const projectid = params?.projectid;

  const projectName =
    typeof projectid === "string" && projectid.trim() !== ""
      ? projectid
      : "No Project Selected";

  useEffect(() => {
    // fetch user and profile on mount
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    };

    getUser();

    // listen for auth changes (sign in/out), update profile accordingly
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", session.user.id)
          .single();
        setProfile(data);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const avatarUrl =
    profile?.avatar_url ?? user?.user_metadata?.avatar_url;
  const displayName =
    profile?.display_name ??
    user?.user_metadata?.full_name ??
    "User";
  const initials = displayName.charAt(0).toUpperCase();

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
          <Link href={`/${params.projectid??""}/charter`} style={styles.link}>
            Project Charter
          </Link>
          <Link href={`/${params.projectid??""}/tasks`} style={styles.link}>
            Tasks
          </Link>
          <Link href={`/${params.projectid??""}/discussions`} style={styles.link}>
            Discussion Boards
          </Link>
        </nav>
      </div>

      {/* Bottom Section */}
      <div style={styles.bottomSection}>
        <div style={styles.profile}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" style={styles.avatarImg} />
          ) : (
            <div style={styles.avatar}>{user ? initials : "U"}</div>
          )}
          <span>{user ? displayName : "Not signed in"}</span>
        </div>

        {user ? <LogoutButton /> : <LoginButton />}

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
    flexShrink: 0,
  },
  avatarImg: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
  }
};