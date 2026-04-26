"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDiscussionBoards } from "@/hooks/useBoards";
import { useDiscussions } from "@/hooks/usePosts";
import { useSearchParams } from "next/navigation";

export default function DiscussionPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");

  const { boards } = useDiscussionBoards(projectId);

  const [openBoardId, setOpenBoardId] = useState(null);

  const toggleBoard = (boardId) => {
    setOpenBoardId((prev) => (prev === boardId ? null : boardId));
  };

  const { posts, loading } = useDiscussions(openBoardId);


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
      <div style={styles.boardList}>
        {boards.map((board) => {
          const isOpen = openBoardId === board.id;

          return (
            <div key={board.id} style={styles.boardWrapper}>
              <button
                onClick={() => toggleBoard(board.id)}
                style={{
                  ...styles.boardHeader,
                  ...(isOpen ? styles.boardHeaderOpen : {}),
                }}
              >
                <span>{board.title}</span>
                <span>{isOpen ? "−" : "+"}</span>
              </button>

              {isOpen && (
                <div style={styles.boardContent}>
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
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

const styles = {
  boardList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  boardWrapper: {
    borderRadius: "6px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },

  boardHeader: {
    width: "100%",
    backgroundColor: "#1f2937",
    color: "white",
    border: "none",
    padding: "12px 15px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: "500",
  },

  boardHeaderOpen: {
    backgroundColor: "#2563eb",
  },

  boardContent: {
    padding: "10px",
    backgroundColor: "#f9fafb",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

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