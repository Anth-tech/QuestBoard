"use client";

import { useDiscussion } from "@/hooks/discussions/usePost";
import { usePostComments } from "@/hooks/comments/useComments";
import { useCreateComment } from "@/hooks/comments/useCreateComment";
import CreateCommentModal from "@/app/components/comments/createCommentModal";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";

export default function DiscussionDetails() {
  const params = useParams();
  const id = params?.id;

  const { user } = useAuth();
  const { post, loading } = useDiscussion(id);
  const { comments, loading: commentsLoading, refetch: refetchComments, } = usePostComments(id);
  const comment = useCreateComment(id, user, refetchComments);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  if (!post) {
    return (
      <div style={{ padding: "20px" }}>
        Post not found<br />
        <small>ID: {id}</small>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* POST SECTION */}
      <div style={styles.postSection}>
        <h1 style={styles.title}>{post.title}</h1>

        <p style={styles.meta}>
          Posted by{" "}
          <strong>{post.profiles?.display_name || "Unknown"}</strong> •{" "}
          {new Date(post.created_at).toLocaleString()}
        </p>

        <p style={styles.content}>{post.description}</p>
      </div>

      {/* COMMENTS HEADER */}
      <div style={styles.commentHeader}>
        <h2 style={styles.commentTitle}>Comments</h2>

        <button
          style={styles.button}
          onClick={() => comment.setShowModal(true)}
        >
          + Add Comment
        </button>
      </div>

      {/* COMMENT LIST */}
      <div style={styles.commentList}>
        {commentsLoading ? (
          <div style={{ padding: "10px", color: "#6b7280" }}>
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div style={{ padding: "10px", color: "#6b7280" }}>
            No comments yet
          </div>
        ) : (
          comments.map((c) => (
            <div key={c.id} style={styles.comment}>
              <div style={{ fontWeight: 600 }}>
                {c.profiles?.display_name || "Unknown"}
              </div>
              <div>{c.content}</div>
              <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "5px" }}>
                {new Date(c.created_at).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* COMMENT MODAL */}
      <CreateCommentModal
        showModal={comment.showModal}
        setShowModal={comment.setShowModal}
        content={comment.content}
        setContent={comment.setContent}
        handleCreateComment={comment.handleCreateComment}
      />
    </div>
  );
}


const styles = {
  page: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },

  postSection: {
    flex: 1,
    padding: "20px",
    borderBottom: "1px solid #e5e7eb",
    overflowY: "auto",
  },

  title: {
    marginBottom: "10px",
  },

  meta: {
    marginBottom: "15px",
    color: "#6b7280",
    fontSize: "14px",
  },

  content: {
    marginBottom: "20px",
    color: "#374151",
  },

  commentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },

  commentTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
  },

  commentList: {
    flex: 1,
    overflowY: "auto",
    padding: "15px",
    backgroundColor: "#f9fafb",
  },

  comment: {
    padding: "10px",
    backgroundColor: "white",
    borderRadius: "6px",
    marginBottom: "10px",
    border: "1px solid #e5e7eb",
  },

  button: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
};