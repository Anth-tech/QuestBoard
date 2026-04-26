export default function CreateTaskModal({
  showModal,
  setShowModal,
  title,
  setTitle,
  description,
  setDescription,
  priority,
  setPriority,
  deadline,
  setDeadline,
  assignees,
  toggleAssignee,
  members,
  attachment,
  setAttachment,
  handleCreateTask,
}) {
  if (!showModal) return null;

  return (
    <div style={styles.overlay} onClick={() => setShowModal(false)}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Title */}
        <div style={styles.titleRow}>
          <span style={styles.label}>Enter Title*:</span>
          <input
            style={styles.titleInput}
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Priority / Assignees / Deadline row */}
        <div style={styles.controlRow}>
          {/* Priority */}
          <select
            style={styles.select}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="" disabled>
              Set Priority Level*
            </option>
            <option value="optional">Optional</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          {/* Assign Team Members */}
          <div style={styles.dropdownWrapper}>
            <details style={styles.details}>
              <summary style={styles.select}>Assign Team Members ▾</summary>
              <div style={styles.checkList}>
                {members.length === 0 && (
                  <span style={styles.emptyLabel}>No members found</span>
                )}
                {members.map((m) => (
                  <label key={m.id} style={styles.checkItem}>
                    <input
                      type="checkbox"
                      checked={assignees.includes(m.id)}
                      onChange={() => toggleAssignee(m.id)}
                    />
                    {m.display_name}
                  </label>
                ))}
              </div>
            </details>
          </div>

          {/* Deadline */}
          <input
            type="datetime-local"
            style={styles.select}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        {/* Description */}
        <span style={styles.label}>Enter Description:</span>
        <textarea
          style={styles.textarea}
          placeholder="This task requires..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Attachment */}
        <div style={styles.attachRow}>
          <label style={styles.attachButton}>
            ▲ Upload Attachment
            <input
              type="file"
              style={{ display: "none" }}
              onChange={(e) => setAttachment(e.target.files[0])}
            />
          </label>
          {attachment && (
            <div style={styles.attachPreview}>
              <div style={styles.attachThumb} />
              <span>{attachment.name}</span>
            </div>
          )}
        </div>

        {/* Submit */}
        <button style={styles.createButton} onClick={handleCreateTask}>
          Create Task
        </button>
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
    zIndex: 2000,
  },
  modal: {
    backgroundColor: "#1f2937",
    borderRadius: "12px",
    padding: "28px",
    width: "500px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    position: "relative",
  },
  titleRow: { display: "flex", alignItems: "center", gap: "12px" },
  label: { color: "white", fontWeight: "bold", whiteSpace: "nowrap" },
  titleInput: {
    flex: 1,
    backgroundColor: "#374151",
    border: "none",
    borderRadius: "20px",
    padding: "8px 16px",
    color: "white",
    fontSize: "14px",
  },
  controlRow: { display: "flex", gap: "10px", alignItems: "flex-start" },
  select: {
    backgroundColor: "#374151",
    color: "white",
    border: "none",
    borderRadius: "20px",
    padding: "8px 14px",
    fontSize: "13px",
    cursor: "pointer",
    flex: 1,
  },
  dropdownWrapper: { flex: 1, position: "relative" },
  details: { width: "100%" },
  checkList: {
    position: "absolute",
    top: "100%",
    left: 0,
    backgroundColor: "#374151",
    borderRadius: "8px",
    padding: "8px",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: "160px",
  },
  checkItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "white",
    fontSize: "13px",
    cursor: "pointer",
  },
  emptyLabel: { color: "#9ca3af", fontSize: "13px" },
  textarea: {
    backgroundColor: "#d1d5db",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "14px",
    resize: "vertical",
    minHeight: "120px",
    color: "#111827",
  },
  attachRow: { display: "flex", alignItems: "center", gap: "12px" },
  attachButton: {
    backgroundColor: "#374151",
    color: "white",
    borderRadius: "8px",
    padding: "10px 18px",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  attachPreview: {
    backgroundColor: "#374151",
    borderRadius: "8px",
    padding: "8px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "white",
    fontSize: "13px",
  },
  attachThumb: {
    width: "28px",
    height: "28px",
    backgroundColor: "#7c3aed",
    borderRadius: "4px",
  },
  createButton: {
    backgroundColor: "#7c3aed",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    alignSelf: "center",
    width: "60%",
  },
};
