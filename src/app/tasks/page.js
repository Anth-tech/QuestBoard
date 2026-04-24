"use client";
 
import { useState, useRef, useEffect } from "react";
 
// placeholder task data — replace with supabase
const FAKE_TASKS = [
  {
    id: 1,
    title: "Task 1",
    priority: "Urgent",
    status: "Not started",
    deadline: "04/23/26",
    description: "Placeholder.",
    assignees: ["John Smith"],
    attachments: [{ name: "Image123.png", type: "image" }],
  },
  {
    id: 2,
    title: "Task 2",
    priority: "Low",
    status: "In Progress",
    deadline: "04/23/26",
    description: "",
    assignees: [],
    attachments: [
      { name: "Attach.png", type: "image" },
      { name: "Attach.png", type: "image" },
      { name: "Attach.zip", type: "zip" },
      { name: "Extra.pdf", type: "pdf" },
      { name: "More.png", type: "image" },
    ],
  },
  {
    id: 3,
    title: "Long title",
    priority: "High",
    status: "Completed",
    deadline: "04/23/26",
    description: "Finished title.",
    assignees: [],
    attachments: [],
  },
  {
    id: 4,
    title: "Task 3",
    priority: "Medium",
    status: "Not started",
    deadline: "04/30/26",
    description: "",
    assignees: [],
    attachments: [],
  },
  {
    id: 5,
    title: "Task 4",
    priority: "Low",
    status: "Not started",
    deadline: "04/30/26",
    description: "",
    assignees: [],
    attachments: [],
  },
  {
    id: 6,
    title: "Task 5",
    priority: "Medium",
    status: "Not started",
    deadline: "04/30/26",
    description: "",
    assignees: [],
    attachments: [],
  },
];
 
// priority levels colors
const PRIORITY_COLOR = {
  Urgent: "#dc2626",
  High: "#ea580c",
  Medium: "#2563eb",
  Low: "#16a34a",
};
 
// ranks used for sorting — lower number = higher priority
const PRIORITY_ORDER = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
 
// ranks used for sorting by status
const STATUS_ORDER = { "Not started": 0, "In Progress": 1, Completed: 2 };
 
// options shown in the sort dropdown
const SORT_OPTIONS = [
  { label: "Deadline", value: "deadline" },
  { label: "Priority", value: "priority" },
  { label: "Status", value: "status" },
  { label: "Title", value: "title" },
];
 
/** sortTasks returns a sorted copy of the task array based on the selected field. does not mutate the original array.
  
   @param {Array} tasks - the full list of tasks to sort
   @param {string|null} sortBy - the field to sort by, or null for default order
   @returns {Array} sorted task array
 */
function sortTasks(tasks, sortBy) {
  if (!sortBy) return tasks;
 
  return [...tasks].sort((a, b) => {
    switch (sortBy) {
      case "deadline":
        // parse mm/dd/yy strings into date objects for comparison
        return new Date(a.deadline) - new Date(b.deadline);
      case "priority":
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      case "status":
        return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      case "title":
        // alphabetical sort
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
}
 
/** SortDropdown renders the "sort by" button and its dropdown menu. clicking the active option again clears the sort. closes automatically when clicking outside.

   @param {string|null} sortBy - currently active sort field
   @param {Function} setSortBy - setter to update the sort field in the parent
 */
function SortDropdown({ sortBy, setSortBy }) {
  const [open, setOpen] = useState(false);
 
  // ref used to detect clicks outside the dropdown
  const ref = useRef(null);
 
  // close the dropdown when the user clicks anywhere outside it
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
 
  const active = SORT_OPTIONS.find((o) => o.value === sortBy);
 
  return (
    <div ref={ref} style={styles.sortWrap}>
      <button style={styles.sortBtn} onClick={() => setOpen((o) => !o)}>
        Sort By{active ? `: ${active.label}` : ""} ▾
      </button>
 
      {open && (
        <div style={styles.dropdown}>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              style={{
                ...styles.dropdownItem,
                ...(sortBy === opt.value ? styles.dropdownItemActive : {}),
              }}
              onClick={() => {
                // clicking the active option clears the sort
                setSortBy(sortBy === opt.value ? null : opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
              {sortBy === opt.value && <span style={styles.checkmark}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
 
/** TaskModal - full-detail popup for a task card.
   displays priority, status, deadline, assignees, description, and attachments.
   clicking the backdrop or the ✕ button closes the modal.
   "take task" shall assign the current user and set status to in progress.
  
   @param {Object} task - the task object to display
   @param {Function} onClose - callback to close the modal
 */
function TaskModal({ task, onClose }) {
  // cap attachment previews at 3 
  const visibleAttachments = task.attachments.slice(0, 3);
 
  return (
    // close the modal by clicking on the background
    <div style={styles.overlay} onClick={onClose}>
      {/* stop clicks inside the modal from bubbling up to the overlay */}
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.modalClose} onClick={onClose}>✕</button>
 
        <h2 style={styles.modalTitle}>{task.title}</h2>
 
        <div style={styles.modalMeta}>
          <span style={styles.modalMetaItem}>
            <strong>Priority:</strong>{" "}
            <span style={{ color: PRIORITY_COLOR[task.priority] }}>{task.priority}</span>
          </span>
          <span style={styles.modalMetaItem}>
            <strong>Status:</strong> {task.status}
          </span>
          <span style={styles.modalMetaItem}>
            <strong>Deadline:</strong> {task.deadline}
          </span>
        </div>
 
        {/* only show assignee row if there are assignees */}
        {task.assignees.length > 0 && (
          <div style={styles.assigneeRow}>
            {task.assignees.map((a) => (
              <span key={a} style={styles.assigneeBadge}>Assignees: {a}</span>
            ))}
          </div>
        )}
 
        {/* default description */}
        <p style={styles.modalDesc}>
          {task.description ||
            "No description provided. Click 'Take Task' to assign yourself — this will set the status to In Progress and add you as an assignee."}
        </p>
 
        {task.attachments.length > 0 && (
          <div style={styles.attachGrid}>
            {visibleAttachments.map((att, i) => (
              <div key={i} style={styles.attachThumb}>
                <div style={styles.attachIcon} />
                <span style={styles.attachName}>{att.name}</span>
              </div>
            ))}
          </div>
        )}
 
        {/* todo: wire this up to supabase to assign the current user */}
        <button style={styles.takeTaskBtn}>Take Task</button>
      </div>
    </div>
  );
}
 
/**
   TaskCard shown in the grid.
   shows title, deadline, priority/status badge, description, and attachment previews.
 
   @param {Object} task - the task to render
   @param {Function} onClick - opens modal when the card is clicked
 */
function TaskCard({ task, onClick }) {
  const isCompleted = task.status === "Completed";
 
  // only show the first attachment on the card. "+N more" badge for the rest
  const firstAttachment = task.attachments[0];
  const extraCount = task.attachments.length - 1;
 
  return (
    <div
      style={{ ...styles.card, ...(isCompleted ? styles.cardCompleted : {}) }}
      onClick={() => onClick(task)}
    >
      <div style={styles.cardHeader}>
        <span style={{ ...styles.cardTitle, ...(isCompleted ? styles.cardTitleCompleted : {}) }}>
          {task.title}
        </span>
        <span style={styles.cardDeadline}>{task.deadline}</span>
      </div>
 
      <div style={styles.cardBadgeRow}>
        <span
          style={{
            ...styles.priorityBadge,
            // completed tasks use neutral grey instead
            backgroundColor: isCompleted ? "#e5e7eb" : "#eff6ff",
            color: isCompleted ? "#9ca3af" : PRIORITY_COLOR[task.priority],
          }}
        >
          {task.priority}: {task.status}
        </span>
      </div>
 
      {task.description ? (
        <p style={{ ...styles.cardDesc, ...(isCompleted ? styles.cardDescCompleted : {}) }}>
          {task.description}
        </p>
      ) : null}
 
      {task.attachments.length > 0 && (
        <div style={styles.cardAttachRow}>
          {firstAttachment && (
            <span style={styles.attachBadge}>{firstAttachment.name}</span>
          )}
          {extraCount > 0 && (
            <span style={styles.attachBadgeExtra}>+{extraCount} more</span>
          )}
        </div>
      )}
    </div>
  );
}
 
/* Handles search filtering, sort state, and which task modal is open. progress bar reflects the ratio of completed tasks to total tasks.*/
export default function Tasks() {
  // todo: replace with supabase data fetch
  const [tasks] = useState(FAKE_TASKS);
 
  // null -> no modal is open
  const [selectedTask, setSelectedTask] = useState(null);
 
  const [search, setSearch] = useState("");
 
  // default order
  const [sortBy, setSortBy] = useState(null);
 
  // apply search filter first
  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = sortTasks(filtered, sortBy);
 
  // progress is based on total tasks
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const progress = Math.round((completed / tasks.length) * 100);
 
  return (
    <div style={styles.container}>
 
      <div style={styles.header}>
        <h1 style={styles.heading}>Tasks</h1>
        <div style={styles.progressWrap}>
          <div style={styles.progressTrack}>
            {/* width is set inline so it can be dynamic */}
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <span style={styles.progressLabel}>{progress}%</span>
        </div>
      </div>
 
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
      </div>
 
      <div style={styles.grid}>
        {sorted.map((task) => (
          <TaskCard key={task.id} task={task} onClick={setSelectedTask} />
        ))}
      </div>
 
      {selectedTask && (
        <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}
 
const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#fff",
    minHeight: "100vh",
    fontFamily: "sans-serif",
    color: "#000",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  heading: { fontSize: "24px", fontWeight: 700, margin: 0 },
  progressWrap: { display: "flex", alignItems: "center", gap: "10px" },
  progressTrack: {
    width: "120px",
    height: "10px",
    backgroundColor: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: "999px",
    transition: "width 0.3s",
  },
  progressLabel: { fontSize: "13px", color: "#6b7280" },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    padding: "8px 12px",
    gap: "8px",
    width: "260px",
  },
  searchIcon: { fontSize: "14px", opacity: 0.5 },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    color: "#111",
    fontSize: "14px",
    width: "100%",
  },
  sortWrap: { position: "relative" },
  sortBtn: {
    background: "none",
    border: "none",
    color: "#374151",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: 500,
    padding: "8px 4px",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 4px)",
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    minWidth: "160px",
    zIndex: 100,
    overflow: "hidden",
  },
  dropdownItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: "10px 14px",
    background: "none",
    border: "none",
    fontSize: "14px",
    color: "#374151",
    cursor: "pointer",
    textAlign: "left",
  },
  dropdownItemActive: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontWeight: 600,
  },
  checkmark: { fontSize: "13px", color: "#2563eb" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
  card: {
    backgroundColor: "#f3f4f6",
    borderRadius: "6px",
    padding: "14px",
    cursor: "pointer",
    transition: "background-color 0.15s",
  },
  cardCompleted: { opacity: 0.6 },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "6px",
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: "15px",
    color: "#000",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
  },
  cardTitleCompleted: { color: "#6b7280", textDecoration: "line-through" },
  cardDeadline: { fontSize: "12px", color: "#9ca3af", flexShrink: 0 },
  cardBadgeRow: { marginBottom: "8px" },
  priorityBadge: {
    display: "inline-block",
    fontSize: "12px",
    fontWeight: 600,
    padding: "2px 10px",
    borderRadius: "999px",
  },
  cardDesc: {
    fontSize: "13px",
    color: "#374151",
    margin: "0 0 8px",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: "1.5",
  },
  cardDescCompleted: { color: "#9ca3af" },
  cardAttachRow: { display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" },
  attachBadge: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "11px",
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: "999px",
  },
  attachBadgeExtra: {
    backgroundColor: "#e5e7eb",
    color: "#374151",
    fontSize: "11px",
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: "999px",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
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
    color: "#000",
  },
  modalMeta: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    paddingBottom: "12px",
    borderBottom: "1px solid #e5e7eb",
    gap: "8px",
  },
  modalMetaItem: { fontSize: "13px", color: "#374151" },
  assigneeRow: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" },
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
  attachGrid: { display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" },
  attachThumb: {
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid #e5e7eb",
  },
  attachIcon: {
    width: "32px",
    height: "32px",
    backgroundColor: "#2563eb",
    borderRadius: "5px",
    flexShrink: 0,
  },
  attachName: { fontSize: "13px", fontWeight: 600, color: "#111" },
  takeTaskBtn: {
    display: "block",
    width: "100%",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "12px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
};