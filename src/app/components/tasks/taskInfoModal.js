import { createClient } from "@/lib/client";

const supabase = createClient();

const PRIORITY_COLOR = {
  urgent: "#dc2626",
  high: "#ea580c",
  medium: "#2563eb",
  low: "#16a34a",
  optional: "#9ca3af",
};

// returns a public URL for a file in the task-attachments bucket
function getAttachmentUrl(taskId, filename) {
  const { data } = supabase.storage
    .from("task-attachments")
    .getPublicUrl(`${taskId}/${filename}`);
  return data?.publicUrl;
}

// used to determine which files are images so they can be displayed in the modal
function isImage(filename) {
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(filename);
}

// creates a modal that displays the information of a task, users can assign themselves to a task and assignees can update the status
export default function TaskInfoModal({ task, onClose, onTakeTask, onUpdateStatus, user, isOwner }) {
  if (!task) return null;

  const assignees = task.task_assignees ?? [];
  const isAssigned = assignees.some((a) => a.user_id === user?.id);
  const isCompleted = task.status === "completed";

  // formats deadline
  const deadline = task.deadline
    ? new Date(task.deadline).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      })
    : "No deadline";

  const priority = task.priority ?? "medium";
  const status = task.status ?? "not_started";

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.modalClose} onClick={onClose}>
          ✕
        </button>

        <h2 style={styles.modalTitle}>{task.title}</h2>

        <div style={styles.modalMeta}>
          <span style={styles.modalMetaItem}>
            <strong>Priority:</strong>{" "}
            <span style={{ color: PRIORITY_COLOR[priority] }}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
          </span>
          <span style={styles.modalMetaItem}>
            <strong>Status:</strong>{" "}
            {status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
          <span style={styles.modalMetaItem}>
            <strong>Deadline:</strong> {deadline}
          </span>
          {task.reward > 0 && (
            <span style={styles.modalMetaItem}>
              <strong>Reward:</strong> {task.reward} pts
            </span>
          )}
        </div>

        {assignees.length > 0 && (
          <div style={styles.assigneeRow}>
            {assignees.map((a) => (
              <span key={a.user_id} style={styles.assigneeBadge}>
                {a.profiles?.display_name ?? "Unknown"}
              </span>
            ))}
          </div>
        )}

        {(isAssigned || isOwner) && !isCompleted && (
          <div style={styles.statusRow}>
            <label style={styles.statusLabel}>Update Status:</label>
            <select
              style={styles.statusSelect}
              value={status}
              onChange={(e) => onUpdateStatus(task.id, e.target.value)}
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}

        <p style={styles.modalDesc}>
          {task.description || "No description provided."}
        </p>

        {/* Attachments */}
        {task.attachments?.length > 0 && (
          <div style={styles.attachGrid}>
            {task.attachments.map((filename, i) => {
              const url = getAttachmentUrl(task.id, filename);
              return isImage(filename) ? (
                <img
                  key={i}
                  src={url}
                  alt={filename}
                  style={styles.attachImg}
                />
              ) : (
                <a key={i} href={url} target="_blank" style={styles.attachFile}>
                  <div style={styles.attachIcon} />
                  <span style={styles.attachName}>{filename}</span>
                </a>
              );
            })}
          </div>
        )}

        {!isCompleted && (
          <button
            style={{
              ...styles.takeTaskBtn,
              backgroundColor: isAssigned ? "#16a34a" : "#2563eb",
            }}
            onClick={() => !isAssigned && onTakeTask(task)}
          >
            {isAssigned ? "✓ Already Assigned" : "Take Task"}
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 500,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "28px",
    width: "100%",
    maxWidth: "540px",
    maxHeight: "80vh",
    overflowY: "auto",
    position: "relative",
    color: "#000",
    margin: "0 16px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  modalClose: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "none",
    border: "1px solid #d1d5db",
    color: "#374151",
    width: "28px",
    height: "28px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: 700,
    margin: "0 0 16px",
    textAlign: "center",
  },
  modalMeta: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    paddingBottom: "12px",
    borderBottom: "1px solid #e5e7eb",
    gap: "8px",
    flexWrap: "wrap",
  },
  modalMetaItem: { fontSize: "13px", color: "#374151" },
  assigneeRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "14px",
  },
  assigneeBadge: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "999px",
    padding: "4px 14px",
    fontSize: "13px",
    color: "#1d4ed8",
    fontWeight: 500,
  },
  modalDesc: {
    fontSize: "14px",
    lineHeight: "1.7",
    color: "#374151",
    marginBottom: "20px",
  },
  attachGrid: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  attachImg: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "6px",
  },
  attachFile: {
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid #e5e7eb",
    textDecoration: "none",
  },
  attachIcon: {
    width: "32px",
    height: "32px",
    backgroundColor: "#2563eb",
    borderRadius: "5px",
  },
  attachName: { fontSize: "13px", fontWeight: 600, color: "#111" },
  takeTaskBtn: {
    display: "block",
    width: "100%",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "12px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
    statusRow: {
    display: "flex", alignItems: "center",
    gap: "12px", marginBottom: "14px",
  },
  statusLabel: { fontSize: "13px", color: "#374151", fontWeight: 600 },
  statusSelect: {
    backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb",
    borderRadius: "6px", padding: "6px 10px",
    fontSize: "13px", color: "#374151", cursor: "pointer",
  },
};
