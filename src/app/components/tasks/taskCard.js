const PRIORITY_COLOR = {
  urgent: "#dc2626",
  high: "#ea580c",
  medium: "#2563eb",
  low: "#16a34a",
  optional: "#9ca3af",
};

export default function TaskCard({ task, onClick }) {
  const isCompleted = task.status === "completed";
  const priority = task.priority ?? "medium";
  const status = task.status ?? "not_started";
  const assignees = task.task_assignees ?? [];

  // formats deadline
  
  const deadline = task.deadline
    ? new Date(task.deadline.slice(0, 10) + "T00:00:00").toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      })
    : "No deadline";

  return (
    <div
      style={{ ...styles.card, ...(isCompleted ? styles.cardCompleted : {}) }}
      onClick={() => onClick(task)}
    >
      <div style={styles.cardHeader}>
        <span
          style={{
            ...styles.cardTitle,
            ...(isCompleted ? styles.cardTitleCompleted : {}),
          }}
        >
          {task.title}
        </span>
        <span style={styles.cardDeadline}>{deadline}</span>
      </div>

      <div style={styles.cardBadgeRow}>
        <span
          style={{
            ...styles.priorityBadge,
            backgroundColor: isCompleted ? "#e5e7eb" : "#eff6ff",
            color: isCompleted ? "#9ca3af" : PRIORITY_COLOR[priority],
          }}
        >
          {priority.charAt(0).toUpperCase() + priority.slice(1)}:{" "}
          {status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      </div>

      {task.description && (
        <p
          style={{
            ...styles.cardDesc,
            ...(isCompleted ? styles.cardDescCompleted : {}),
          }}
        >
          {task.description}
        </p>
      )}

      {assignees.length > 0 && (
        <div style={styles.assigneeRow}>
          {assignees.slice(0, 3).map((a) => (
            <span key={a.user_id} style={styles.assigneeBadge}>
              {a.profiles?.display_name ?? "Unknown"}
            </span>
          ))}
          {assignees.length > 3 && (
            <span style={styles.assigneeBadgeExtra}>
              +{assignees.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
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
  assigneeRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginTop: "6px",
  },
  assigneeBadge: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "11px",
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: "999px",
  },
  assigneeBadgeExtra: {
    backgroundColor: "#e5e7eb",
    color: "#374151",
    fontSize: "11px",
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: "999px",
  },
};
