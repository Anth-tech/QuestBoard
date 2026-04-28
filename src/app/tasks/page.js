"use client";
 
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useTaskActions } from "@/hooks/tasks/useTaskActions";
import { useModifyTasks } from "@/hooks/tasks/useModifyTasks";
import { useProjectContext } from "@/app/context/ProjectContext";
import SortTasksDropdown from "@/app/components/tasks/sortTasksDropdown";
import TaskCard from "@/app/components/tasks/taskCard";
import TaskInfoModal from "@/app/components/tasks/taskInfoModal";
 
// ranks used for sorting — lower number = higher priority
const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3, optional: 4 };
 
// ranks used for sorting by status
const STATUS_ORDER = { not_started: 0, in_progress: 1, completed: 2 };
 
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
        return new Date(a.deadline) - new Date(b.deadline);
      case "priority":
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      case "status":
        return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
}
 
/* Handles search filtering, sort state, and which task modal is open. progress bar reflects the ratio of completed tasks to total tasks.*/
export default function Tasks() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
 
  const { user, selectedProject } = useProjectContext();
  const { tasks, loading, refetch } = useTasks(projectId);
  const { takeTask, updateStatus } = useTaskActions(user, refetch);
  const { editTask, deleteTask } = useModifyTasks(refetch);
  const isOwner = user?.id === selectedProject?.owner_id;
 
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
  const completed = tasks.filter((t) => t.status === "completed").length;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
 
  // after an edit, refetch then re-point selectedTask at the fresh version of the
  // same task so the modal immediately reflects the updated fields and attachments
  const handleEdit = async (updatedTask) => {
    await editTask(updatedTask);
    // refetch is called inside editTask, but tasks state won't have updated yet —
    // call it again and await so we get the fresh list back to find the task
    const freshTasks = await refetch();
    const refreshed = (freshTasks ?? []).find((t) => t.id === updatedTask.id);
    if (refreshed) setSelectedTask(refreshed);
  };
 
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.heading}>Tasks</h1>
        <div style={styles.progressWrap}>
          <div style={styles.progressTrack}>
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
        <SortTasksDropdown sortBy={sortBy} setSortBy={setSortBy} />
      </div>
 
      {loading ? (
        <p style={{ color: "#9ca3af" }}>Loading tasks...</p>
      ) : sorted.length === 0 ? (
        <p style={{ color: "#9ca3af" }}>
          {projectId ? "No tasks yet." : "Select a project to view tasks."}
        </p>
      ) : (
        <div style={styles.grid}>
          {sorted.map((task) => (
            <TaskCard key={task.id} task={task} onClick={setSelectedTask} />
          ))}
        </div>
      )}
 
      {selectedTask && (
        <TaskInfoModal 
          task={selectedTask}
          user={user}
          isOwner={isOwner}
          onClose={() => setSelectedTask(null)}
          onTakeTask={async (task) => {
            await takeTask(task);
            setSelectedTask(null);
          }}
          onUpdateStatus={async (taskId, status) => {
            await updateStatus(taskId, status);
            setSelectedTask(null);
          }}
          onEdit={handleEdit}
          onDelete={async (task) => {
            await deleteTask(task.id);
            setSelectedTask(null);
          }}
        />
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
};