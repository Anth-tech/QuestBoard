export default function CreateCommentModal({
  showModal,
  setShowModal,
  content,
  setContent,
  handleCreateComment,
}) {
  if (!showModal) return null;

  return (
    <div style={styles.overlay} onClick={() => setShowModal(false)}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.modalTitle}>Add Comment</h3>

        <label style={styles.label}>Comment</label>
        <textarea
          style={styles.textarea}
          placeholder="Write your comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div style={styles.buttons}>
          <button
            onClick={() => setShowModal(false)}
            style={styles.cancelButton}
          >
            Cancel
          </button>

          <button
            onClick={handleCreateComment}
            style={styles.confirmButton}
            disabled={!content.trim()}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

  modal: {
    backgroundColor: "#1f2937",
    borderRadius: "12px",
    padding: "24px",
    width: "360px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "18px",
    color: "white",
  },

  label: {
    fontSize: "13px",
    color: "#9ca3af",
  },

  textarea: {
    backgroundColor: "#111827",
    border: "1px solid #374151",
    borderRadius: "6px",
    color: "white",
    padding: "10px",
    fontSize: "14px",
    minHeight: "100px",
    resize: "none",
  },

  buttons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "4px",
  },

  cancelButton: {
    background: "none",
    border: "1px solid #374151",
    color: "#9ca3af",
    borderRadius: "6px",
    padding: "6px 14px",
    cursor: "pointer",
  },

  confirmButton: {
    backgroundColor: "#7c3aed",
    border: "none",
    color: "white",
    borderRadius: "6px",
    padding: "6px 14px",
    cursor: "pointer",
  },
};