export default function InviteMemberModal({
  showModal,
  setShowModal,
  email,
  setEmail,
  sendInvite,
  loading,
}) {
  if (!showModal) return null;

  return (
    <div style={styles.overlay} onClick={() => setShowModal(false)}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.modalTitle}>Invite Team Member</h3>

        <label style={styles.label}>User Email*</label>
        <input
          style={styles.input}
          placeholder="Enter user email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div style={styles.buttons}>
          <button
            onClick={() => setShowModal(false)}
            style={styles.cancelButton}
          >
            Cancel
          </button>
          <button 
            onClick={sendInvite} 
            style={styles.confirmButton}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Invite"}
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
    padding: "24px",
    borderRadius: "8px",
    width: "400px",
    maxWidth: "90%",
  },
  modalTitle: {
    color: "white",
    marginBottom: "20px",
    fontSize: "18px",
  },
  label: {
    display: "block",
    color: "#9ca3af",
    marginBottom: "8px",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #374151",
    backgroundColor: "#374151",
    color: "white",
    marginBottom: "20px",
    fontSize: "14px",
  },
  buttons: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "transparent",
    color: "#9ca3af",
    border: "1px solid #374151",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  confirmButton: {
    padding: "10px 20px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
};