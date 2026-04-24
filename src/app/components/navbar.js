"use client";

import Link from "next/link";
import LoginButton from "./loginButton";
import LogoutButton from "./logoutButton";
import { useAuth } from "../context/authContext";

export default function NavBar({ projectName = "Project A1" }) {//optional name for now for placeholders
  const auth = useAuth();

  const user = auth?.user ?? null;
  const profile = auth?.profile ?? null;
  const loading = auth?.loading ?? false;

  if (loading) return null;

  // gets avatar from user metadata, display name from profile or user metadata, and falls back to "User" if neither is available
  const avatarUrl = profile?.avatar_url ?? user?.user_metadata?.avatar_url ?? null;
  const displayName = profile?.display_name ?? user?.user_metadata?.full_name ?? "User";
  const initials = displayName.charAt(0).toUpperCase() ?? "";

  return (
    <aside style={styles.sidebar}>
      {/* Top Section */}
      <div>
        <h2 style={styles.logo}>QuestBoard</h2>

        <div style={styles.projectBox}>
          {/*Section for the current project - placeholder*/}
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
        <div style={styles.profile}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" style={styles.avatarImg} />
          ) : (
            <div style={styles.avatar}>{user ? initials : "U"}</div>
          )}
          <span>{user ? displayName : "Not signed in"}</span>
        </div>

        {user ? (
          <LogoutButton />
        ) : (
          <LoginButton />
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