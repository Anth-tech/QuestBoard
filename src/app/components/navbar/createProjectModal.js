export default function CreateProjectModal({
  showModal,
  setShowModal,
  newProjectName,
  setNewProjectName,
  newProjectDesc,
  setNewProjectDesc,
  handleCreateProject,
}) {
  if (!showModal) return null;

  return (
    <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.modalTitle}>New Project</h3>

        <label style={styles.modalLabel}>Name: *</label>
        <input
          style={styles.modalInput}
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="Project name"
        />

        <label style={styles.modalLabel}>Description:</label>
        <textarea
          style={{ ...styles.modalInput, resize: "vertical", height: "80px" }}
          value={newProjectDesc}
          onChange={(e) => setNewProjectDesc(e.target.value)}
          placeholder="Optional description"
        />

        <div style={styles.modalButtons}>
          <button
            onClick={() => setShowModal(false)}
            style={styles.cancelButton}
          >
            Cancel
          </button>
          <button onClick={handleCreateProject} style={styles.confirmButton}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  modal: {
    backgroundColor: "#1f2937",
    borderRadius: "10px",
    padding: "20px",
    width: "340px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  modalTitle: { margin: 0, fontSize: "18px", color: "white" },
  modalLabel: { fontSize: "12px", color: "#9ca3af" },
  modalInput: {
    backgroundColor: "#111827",
    border: "1px solid #374151",
    borderRadius: "6px",
    color: "white",
    padding: "8px",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "6px",
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
    backgroundColor: "#3b82f6",
    border: "none",
    color: "white",
    borderRadius: "6px",
    padding: "6px 14px",
    cursor: "pointer",
  },
};
