export default function CreateDiscussionModal({
  showModal, setShowModal,
  title, setTitle,
  isPrivate, setIsPrivate,
  allowedUsers, toggleUser,
  members,
  handleCreateDiscussion,
}) {
  if (!showModal) return null;

  return (
    <div style={styles.overlay} onClick={() => setShowModal(false)}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.modalTitle}>New Discussion Board</h3>

        <label style={styles.label}>Title *</label>
        <input
          style={styles.input}
          placeholder="Board title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label style={styles.checkItem}>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          <span style={styles.label}>Private board</span>
        </label>

        {isPrivate && (
          <>
            <label style={styles.label}>Who can view & post:</label>
            <div style={styles.checkList}>
              {members.length === 0 && (
                <span style={styles.emptyLabel}>No other members</span>
              )}
              {members.map((m) => (
                <label key={m.id} style={styles.checkItem}>
                  <input
                    type="checkbox"
                    checked={allowedUsers.includes(m.id)}
                    onChange={() => toggleUser(m.id)}
                  />
                  {m.display_name}
                </label>
              ))}
            </div>
          </>
        )}

        <div style={styles.buttons}>
          <button onClick={() => setShowModal(false)} style={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleCreateDiscussion} style={styles.confirmButton}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex", alignItems: "center", justifyContent: "center",
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
  modalTitle: { margin: 0, fontSize: "18px", color: "white" },
  label: { fontSize: "13px", color: "#9ca3af" },
  input: {
    backgroundColor: "#111827",
    border: "1px solid #374151",
    borderRadius: "6px",
    color: "white",
    padding: "8px",
    fontSize: "14px",
  },
  checkList: {
    display: "flex", flexDirection: "column", gap: "8px",
    backgroundColor: "#111827",
    borderRadius: "8px",
    padding: "10px",
  },
  checkItem: {
    display: "flex", alignItems: "center", gap: "8px",
    color: "white", fontSize: "14px", cursor: "pointer",
  },
  emptyLabel: { color: "#6b7280", fontSize: "13px" },
  buttons: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" },
  cancelButton: {
    background: "none", border: "1px solid #374151",
    color: "#9ca3af", borderRadius: "6px",
    padding: "6px 14px", cursor: "pointer",
  },
  confirmButton: {
    backgroundColor: "#7c3aed", border: "none",
    color: "white", borderRadius: "6px",
    padding: "6px 14px", cursor: "pointer",
  },
};