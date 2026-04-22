"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Get initial session + listen for changes
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user ?? null)
      setLoading(false)
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // 🔐 Sign in with Google OAuth
  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  // 🚪 Sign out
  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <h3 style={{ margin: 0 }}>My App</h3>
      </div>

      <div style={styles.right}>
        {loading ? (
          <span>Loading...</span>
        ) : user ? (
          <>
            <span style={styles.email}>{user.email}</span>
            <button onClick={signOut} style={styles.button}>
              Sign out
            </button>
          </>
        ) : (
          <button onClick={signIn} style={styles.button}>
            Sign in with Google
          </button>
        )}
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    borderBottom: "1px solid #eee",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  button: {
    padding: "8px 12px",
    cursor: "pointer",
    border: "1px solid #ccc",
    borderRadius: "6px",
    background: "white",
  },
  email: {
    fontSize: "14px",
    opacity: 0.7,
  },
}