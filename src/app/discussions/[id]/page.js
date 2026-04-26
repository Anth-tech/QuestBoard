"use client";
import { use } from "react";

export default function DiscussionDetails({ params }) {
  const { id } = use(params);

  const post = {
    id: id,
    title: "Placeholder Discussion Title",
    content:
      "This page is very much a placeholder for until we actually get the backend set up",
    images: [
      "https://via.placeholder.com/600x300?text=Placeholder+Image",
      "https://via.placeholder.com/600x300?text=Placeholder+Image",
    ],
  };

  //Placeholders for the comments
  const comments = [
    { id: 1, text: "Placeholder comment one." },
    { id: 2, text: "Placeholder comment two." },
    { id: 3, text: "Placeholder comment three." },
    { id: 4, text: "Placeholder comment four." },
    { id: 5, text: "Placeholder comment five." },
    { id: 6, text: "Placeholder comment six." },
    { id: 7, text: "Placeholder comment seven." },
    { id: 8, text: "Placeholder comment eight." },
    { id: 9, text: "Placeholder comment nine." },
    { id: 10, text: "Placeholder comment ten." },
    { id: 11, text: "Placeholder comment eleven." },
    { id: 12, text: "Placeholder comment twelve." },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.postSection}>
        <h1 style={styles.title}>{post.title}</h1>

        <p style={styles.content}>{post.content}</p>

        <div style={styles.imageGrid}>
          {post.images.map((img, i) => (
            <img key={i} src={img} style={styles.image} />
          ))}
        </div>
      </div>

      <div style={styles.commentSection}>
        
        {/*Scrollable comments*/}
        <div style={styles.commentList}>
          {comments.map((c) => (
            <div key={c.id} style={styles.comment}>
              {c.text}
            </div>
          ))}
        </div>

        {/*add comment section*/}
        <div style={styles.inputWrapper}>
          <div style={styles.inputBox}>
            <input
              placeholder="Write a comment..."
              style={styles.input}
            />

            <button style={styles.button}>
              Add Comment
            </button>
          </div>
        </div>
      </div>
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
  content: {
    marginBottom: "20px",
    color: "#374151",
  },
  imageGrid: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  image: {
    width: "300px",
    borderRadius: "8px",
  },

  commentSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden", // important
  },

  commentList: {
    flex: 1,
    overflowY: "auto",
    padding: "15px",
    backgroundColor: "#f9fafb",
  },

  inputWrapper: {
    padding: "15px",
    backgroundColor: "white",
    borderTop: "1px solid #e5e7eb",
  },

  comment: {
    padding: "10px",
    backgroundColor: "white",
    borderRadius: "6px",
    marginBottom: "10px",
    border: "1px solid #e5e7eb",
  },

  inputWrapper: {
    padding: "15px",
    backgroundColor: "white",
    borderTop: "1px solid #e5e7eb",
  },

  inputBox: {
    display: "flex",
    gap: "10px",
    padding: "10px",
    backgroundColor: "white",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },

  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
  },

  button: {
    padding: "10px 15px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};