"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { useDiscussionBoards } from "@/hooks/useBoards";
import { useDiscussions } from "@/hooks/usePosts";

export default function DiscussionPage() {
  const { selectedProject } = useProjects();

  //const { boards } = useDiscussionBoards(selectedProject?.id);
  const { boards } = useDiscussionBoards('f566845d-220c-4cb7-89d8-bd1595073c11');

  const [selectedBoard, setSelectedBoard] = useState(null);

  const { posts, loading } = useDiscussions(selectedBoard?.id);

  // Auto-select first board when boards load
  useEffect(() => {
    if (boards.length > 0 && !selectedBoard) {
      setSelectedBoard(boards[0]);
    }
  }, [boards]);

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <h1>Discussion Boards</h1>

        <button style={styles.button}>
          + Create Post
        </button>
      </div>

      {/* Board Tabs */}
      <div style={styles.boardTabs}>
        {boards.map((board) => (
          <button
            key={board.id}
            onClick={() => setSelectedBoard(board)}
            style={{
              ...styles.boardTab,
              backgroundColor:
                selectedBoard?.id === board.id ? "#3b82f6" : "#1f2937",
            }}
          >
            {board.title}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div style={styles.list}>
        {loading ? (
          <p style={{ color: "#9ca3af" }}>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p style={{ color: "#9ca3af" }}>No posts yet.</p>
        ) : (
          posts.map((post) => (
            <Link
              key={post.id}
              href={`/discussions/${post.id}`}
              style={styles.post}
            >
              <span>{post.title}</span>

              {/*<span style={styles.commentBadge}>
                {post.commentCount}
              </span>*/}
            </Link>
          ))
        )}
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