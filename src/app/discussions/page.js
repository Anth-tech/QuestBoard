"use client";

import Link from "next/link";

export default function DiscussionPage() {
  // Fake data (later from Supabase)
  const posts = [
    { id: 1, title: "Project requirement discussion", commentCount: 3 },
    { id: 2, title: "Task N issues", commentCount: 12 },
    { id: 3, title: "Deadline concernes", commentCount: 0 },
  ];

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <div style={styles.header}>
        <h1>Discussion Boards</h1>

        <button style={styles.button}>
          + Create Post
        </button>
      </div>

      {/* Posts List */}
      <div style={styles.list}>
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/discussions/${post.id}`}
            style={styles.post}
          >
            <span>{post.title}</span>

            <span style={styles.commentBadge}>
              {post.commentCount} 💬
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  button: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  post: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    padding: "12px",
    backgroundColor: "#f3f4f6",
    borderRadius: "6px",
    textDecoration: "none",
    color: "black",
  },

  commentBadge: {
    backgroundColor: "#e5e7eb",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    color: "#374151",
    minWidth: "50px",
    textAlign: "center",
  },
};