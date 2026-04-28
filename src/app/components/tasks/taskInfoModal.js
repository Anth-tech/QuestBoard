import { createClient } from "@/lib/client";
import { useEffect, useRef, useState } from "react";
 
const supabase = createClient();
 
const PRIORITY_COLOR = {
  urgent: "#dc2626",
  high: "#ea580c",
  medium: "#2563eb",
  low: "#16a34a",
  optional: "#9ca3af",
};
 
// returns a signed url that'll be used to download task files
async function getSignedUrl(taskId, filename) {
  const { data, error } = await supabase.storage
    .from("task-attachments")
    .createSignedUrl(`${taskId}/${filename}`, 60 * 60); // expires in 1 hour
  if (error) { console.error("Signed URL error:", error.message); return null; }
  return data?.signedUrl;
}
 
// used to determine which files are images so they can be displayed in the modal
function isImage(filename) {
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(filename);
}
 
// creates a modal that displays the information of a task, users can assign themselves to a task and assignees can update the status
export default function TaskInfoModal({ task, onClose, onTakeTask, onUpdateStatus, onDelete, onEdit, user, isOwner, folders = [], onAssignFolder }) {
  if (!task) return null;
 
  const [attachmentUrls, setAttachmentUrls] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title ?? "",
    description: task.description ?? "",
    priority: task.priority ?? "medium",
    deadline: task.deadline ? task.deadline.split("T")[0] : "",
    folder_id: task.folder_id ?? "",
  });
  // existing filenames the user wants to keep (starts as the full current list)
  const [keptAttachments, setKeptAttachments] = useState(task.attachments ?? []);
  // new File objects the user picked but hasn't saved yet
  const [newFiles, setNewFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
 
  useEffect(() => {
    if (!task?.attachments?.length) return;
 
    const resolveUrls = async () => {
      const entries = await Promise.all(
        task.attachments.map(async (filename) => {
          const url = await getSignedUrl(task.id, filename);
          return [filename, url];
        })
      );
      setAttachmentUrls(Object.fromEntries(entries));
    };
 
    resolveUrls();
  }, [task]);
 
  const assignees = task.task_assignees ?? [];
  const isAssigned = assignees.some((a) => a.user_id === user?.id);
  const isCompleted = task.status === "completed";
 
  // formats deadline for view mode
  const deadline = task.deadline
    ? new Date(task.deadline).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      })
    : "No deadline";
 
  const priority = task.priority ?? "medium";
  const status = task.status ?? "not_started";
 
  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };
 
  // mark an existing attachment for removal
  const handleRemoveKept = (filename) => {
    setKeptAttachments((prev) => prev.filter((f) => f !== filename));
  };
 
  // add new files from the file picker, skip duplicates by name
  const handleFilesPicked = (e) => {
    const picked = Array.from(e.target.files ?? []);
    setNewFiles((prev) => {
      const existingNames = new Set([
        ...keptAttachments,
        ...prev.map((f) => f.name),
      ]);
      return [...prev, ...picked.filter((f) => !existingNames.has(f.name))];
    });
    // reset input so the same file can be re-added after being removed
    e.target.value = "";
  };
 
  // remove a not-yet-saved file from the pending list
  const handleRemoveNew = (name) => {
    setNewFiles((prev) => prev.filter((f) => f.name !== name));
  };
 
  const handleEditSave = async () => {
    setSaving(true);
    await onEdit({
      ...task,
      ...editForm,
      folder_id: editForm.folder_id || null,
      // pass both lists so the hook can diff and act
      keptAttachments,
      newFiles,
    });
    setSaving(false);
    setIsEditing(false);
  };
 
  const handleEditCancel = () => {
    setEditForm({
      title: task.title ?? "",
      description: task.description ?? "",
      priority: task.priority ?? "medium",
      deadline: task.deadline ? task.deadline.split("T")[0] : "",
      folder_id: task.folder_id ?? "",
    });
    setKeptAttachments(task.attachments ?? []);
    setNewFiles([]);
    setIsEditing(false);
  };
 
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.modalClose} onClick={onClose}>✕</button>
 
        {isEditing ? (
          /* ── Edit form ── */
          <div style={styles.editForm}>
            <h2 style={styles.modalTitle}>Edit Task</h2>
 
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Title</label>
              <input
                style={styles.fieldInput}
                value={editForm.title}
                onChange={(e) => handleEditChange("title", e.target.value)}
              />
            </div>
 
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Description</label>
              <textarea
                style={styles.fieldTextarea}
                value={editForm.description}
                onChange={(e) => handleEditChange("description", e.target.value)}
                rows={4}
              />
            </div>
 
            <div style={styles.fieldRow}>
              <div style={{ ...styles.fieldGroup, flex: 1 }}>
                <label style={styles.fieldLabel}>Priority</label>
                <select
                  style={styles.fieldSelect}
                  value={editForm.priority}
                  onChange={(e) => handleEditChange("priority", e.target.value)}
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="optional">Optional</option>
                </select>
              </div>
 
              <div style={{ ...styles.fieldGroup, flex: 1 }}>
                <label style={styles.fieldLabel}>Deadline</label>
                <input
                  type="date"
                  style={styles.fieldInput}
                  value={editForm.deadline}
                  onChange={(e) => handleEditChange("deadline", e.target.value)}
                />
              </div>
            </div>
 
            {folders.length > 0 && (
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Folder</label>
                <select
                  style={styles.fieldSelect}
                  value={editForm.folder_id}
                  onChange={(e) => handleEditChange("folder_id", e.target.value)}
                >
                  <option value="">No folder</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            )}
 
            {/* ── Attachments section ── */}
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Attachments</label>
 
              {/* existing attachments the user is keeping */}
              {keptAttachments.length > 0 && (
                <div style={styles.attachEditList}>
                  {keptAttachments.map((filename) => (
                    <div key={filename} style={styles.attachEditItem}>
                      <span style={styles.attachEditName}>{filename}</span>
                      <button
                        style={styles.attachRemoveBtn}
                        title="Remove attachment"
                        onClick={() => handleRemoveKept(filename)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
 
              {/* new files staged for upload */}
              {newFiles.length > 0 && (
                <div style={styles.attachEditList}>
                  {newFiles.map((file) => (
                    <div key={file.name} style={{ ...styles.attachEditItem, ...styles.attachEditItemNew }}>
                      <span style={styles.attachEditName}>
                        <span style={styles.attachNewBadge}>new</span>
                        {file.name}
                      </span>
                      <button
                        style={styles.attachRemoveBtn}
                        title="Remove"
                        onClick={() => handleRemoveNew(file.name)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
 
              {/* hidden file input, triggered by the button below */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={handleFilesPicked}
              />
              <button
                style={styles.addAttachBtn}
                onClick={() => fileInputRef.current?.click()}
              >
                + Add Files
              </button>
            </div>
 
            <div style={styles.editActionRow}>
              <button
                style={{
                  ...styles.saveBtn,
                  opacity: saving || !editForm.title.trim() ? 0.6 : 1,
                  cursor: saving || !editForm.title.trim() ? "not-allowed" : "pointer",
                }}
                onClick={handleEditSave}
                disabled={saving || !editForm.title.trim()}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button style={styles.cancelBtn} onClick={handleEditCancel}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* ── View mode ── */
          <>
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
              {folders.length > 0 && (
                <span style={styles.modalMetaItem}>
                  <strong>Folder:</strong>{" "}
                  {folders.find((f) => f.id === task.folder_id)?.name ?? "None"}
                </span>
              )}
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
 
            {task.attachments?.length > 0 && (
              <div style={styles.attachGrid}>
                {task.attachments.map((filename, i) => {
                  const url = attachmentUrls[filename];
                  return isImage(filename) ? (
                    <div key={i} style={styles.attachImgWrapper}>
                      {url && <img src={url} alt={filename} style={styles.attachImg} />}
                      <a href={url} download={filename} style={styles.attachDownload}>
                        ⬇ Download
                      </a>
                    </div>
                  ) : (
                    <a key={i} href={url} download={filename} style={styles.attachFile}>
                      <div style={styles.attachIcon} />
                      <div>
                        <span style={styles.attachName}>{filename}</span>
                        <span style={styles.attachDownloadLabel}>⬇ Download</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
 
            {/* action buttons row */}
            <div style={styles.actionRow}>
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
 
              {isOwner && onEdit && (
                <button style={styles.editBtn} onClick={() => setIsEditing(true)}>
                  Edit Task
                </button>
              )}
 
              {isOwner && onDelete && (
                <button
                  style={styles.deleteBtn}
                  onClick={() => { if (confirm("Are you sure you want to delete this task?")) onDelete(task); }}
                >
                  Delete Task
                </button>
              )}
            </div>
          </>
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
  attachImgWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    alignItems: "center",
  },
  attachImg: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "6px",
  },
  attachDownload: {
    fontSize: "11px",
    color: "#2563eb",
    textDecoration: "none",
    textAlign: "center",
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
  attachName: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#111",
    display: "block",
  },
  attachDownloadLabel: { fontSize: "11px", color: "#2563eb" },
  actionRow: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
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
  editBtn: {
    display: "block",
    width: "100%",
    backgroundColor: "#fff",
    color: "#2563eb",
    border: "1px solid #2563eb",
    borderRadius: "6px",
    padding: "12px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
  deleteBtn: {
    display: "block",
    width: "100%",
    backgroundColor: "#fff",
    color: "#dc2626",
    border: "1px solid #dc2626",
    borderRadius: "6px",
    padding: "12px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
  },
  statusLabel: { fontSize: "13px", color: "#374151", fontWeight: 600 },
  statusSelect: {
    backgroundColor: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    padding: "6px 10px",
    fontSize: "13px",
    color: "#374151",
    cursor: "pointer",
  },
  // edit form
  editForm: { display: "flex", flexDirection: "column", gap: "16px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  fieldRow: { display: "flex", gap: "12px" },
  fieldLabel: { fontSize: "13px", fontWeight: 600, color: "#374151" },
  fieldInput: {
    backgroundColor: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    padding: "8px 10px",
    fontSize: "14px",
    color: "#111",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  fieldTextarea: {
    backgroundColor: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    padding: "8px 10px",
    fontSize: "14px",
    color: "#111",
    outline: "none",
    width: "100%",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  fieldSelect: {
    backgroundColor: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    padding: "8px 10px",
    fontSize: "14px",
    color: "#374151",
    cursor: "pointer",
    width: "100%",
  },
  // attachment edit list
  attachEditList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  attachEditItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    padding: "7px 10px",
  },
  attachEditItemNew: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  attachEditName: {
    fontSize: "13px",
    color: "#374151",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  attachNewBadge: {
    backgroundColor: "#2563eb",
    color: "#fff",
    fontSize: "10px",
    fontWeight: 700,
    borderRadius: "4px",
    padding: "1px 5px",
    flexShrink: 0,
  },
  attachRemoveBtn: {
    background: "none",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    fontSize: "12px",
    padding: "2px 4px",
    flexShrink: 0,
    lineHeight: 1,
  },
  addAttachBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    border: "1px dashed #d1d5db",
    borderRadius: "6px",
    padding: "7px 14px",
    fontSize: "13px",
    color: "#374151",
    cursor: "pointer",
    fontWeight: 500,
  },
  editActionRow: { display: "flex", gap: "10px", marginTop: "4px" },
  saveBtn: {
    flex: 1,
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "12px",
    fontSize: "15px",
    fontWeight: 600,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#fff",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "12px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
