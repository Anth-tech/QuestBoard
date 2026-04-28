export default function CreateTeamModal({
  showModal,
  setShowModal,
  teamName,
  setTeamName,
  handleCreateTeam,
}) {
  if (!showModal) return null;

  return (
    <div style={styles.overlay} onClick={() => setShowModal(false)}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.modalTitle}>Create New Team</h3>

        <label style={styles.label}>Team Name*</label>
        <input
          style={styles.input}
          placeholder="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />

        <div style={styles.buttons}>
          <button
            onClick={() => setShowModal(false)}
            style={styles.cancelButton}
          >
            Cancel
          </button>
          <button onClick={handleCreateTeam} style={styles.confirmButton}>
            Create
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
  emptyLabel: { color: "#6b7280", fontSize: "13px" },
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
