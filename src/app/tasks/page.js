"use client";
 
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useTaskActions } from "@/hooks/tasks/useTaskActions";
import { useModifyTasks } from "@/hooks/tasks/useModifyTasks";
import { useProjectContext } from "@/app/context/ProjectContext";
import { useFolders } from "@/hooks/tasks/useFolders";
import { useTaskFolders } from "@/hooks/tasks/useTaskFolders";
import SortTasksDropdown from "@/app/components/tasks/sortTasksDropdown";
import TaskCard from "@/app/components/tasks/taskCard";
import TaskInfoModal from "@/app/components/tasks/taskInfoModal";
 
const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3, optional: 4 };
const STATUS_ORDER = { not_started: 0, in_progress: 1, completed: 2 };
 
function sortTasks(tasks, sortBy) {
  if (!sortBy) return tasks;
  return [...tasks].sort((a, b) => {
    switch (sortBy) {
      case "deadline": return new Date(a.deadline) - new Date(b.deadline);
      case "priority": return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      case "status": return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      case "title": return a.title.localeCompare(b.title);
      default: return 0;
    }
  });
}
 
/** Collapsible folder section */
function FolderSection({ title, tasks, onTaskClick, onDelete, isUncategorized = false }) {
  const [open, setOpen] = useState(true);
  if (tasks.length === 0) return null;
 
  return (
    <div style={styles.folderSection}>
      <div style={styles.folderHeader}>
        <button style={styles.folderToggle} onClick={() => setOpen((o) => !o)}>
          <span style={styles.folderChevron}>{open ? "▾" : "▸"}</span>
          <span style={styles.folderIcon}>{isUncategorized ? "📋" : "📁"}</span>
          <span style={styles.folderName}>{title}</span>
          <span style={styles.folderCount}>{tasks.length}</span>
        </button>
        {!isUncategorized && onDelete && (
          <button style={styles.folderDeleteBtn} onClick={onDelete} title="Delete folder">✕</button>
        )}
      </div>
      {open && (
        <div style={styles.grid}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </div>
      )}
    </div>
  );
}
 
/** Inline input for creating a new folder */
function NewFolderInput({ onCreate }) {
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
 
  const handleSubmit = async () => {
    if (!value.trim()) return;
    await onCreate(value);
    setValue("");
    setVisible(false);
  };
 
  if (!visible) {
    return (
      <button style={styles.newFolderBtn} onClick={() => setVisible(true)}>
        + New Folder
      </button>
    );
  }
 
  return (
    <div style={styles.newFolderInputWrap}>
      <input
        autoFocus
        style={styles.newFolderInput}
        placeholder="Folder name..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") setVisible(false);
        }}
      />
      <button style={styles.newFolderConfirm} onClick={handleSubmit}>Add</button>
      <button style={styles.newFolderCancel} onClick={() => setVisible(false)}>Cancel</button>
    </div>
  );
}
 
export default function Tasks() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
 
  const { user, selectedProject } = useProjectContext();
  const { tasks, loading, refetch } = useTasks(projectId);
  const { takeTask, updateStatus } = useTaskActions(user, refetch);
  const { editTask, deleteTask } = useModifyTasks(refetch);
  const { folders, createFolder, deleteFolder } = useFolders(projectId);
  const { assignFolder } = useTaskFolders(refetch);
  const isOwner = user?.id === selectedProject?.owner_id;
 
  const [selectedTask, setSelectedTask] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState(null);
 
  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = sortTasks(filtered, sortBy);
 
  const completed = tasks.filter((t) => t.status === "completed").length;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
 
  const handleEdit = async (updatedTask) => {
    await editTask(updatedTask);
    const freshTasks = await refetch();
    const refreshed = (freshTasks ?? []).find((t) => t.id === updatedTask.id);
    if (refreshed) setSelectedTask(refreshed);
  };
 
  const handleAssignFolder = async (folderId) => {
    if (!selectedTask?.id) return;
    const taskId = selectedTask.id;
    await assignFolder(taskId, folderId);
    const freshTasks = await refetch();
    const refreshed = (freshTasks ?? []).find((t) => t.id === taskId);
    if (refreshed) setSelectedTask(refreshed);
  };
 
  // group tasks by folder_id
  const tasksByFolder = folders.reduce((acc, folder) => {
    acc[folder.id] = sorted.filter((t) => t.folder_id === folder.id);
    return acc;
  }, {});
  const unfoldered = sorted.filter((t) => !t.folder_id);
 
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
        <div style={styles.toolbarRight}>
          <NewFolderInput onCreate={createFolder} />
          <SortTasksDropdown sortBy={sortBy} setSortBy={setSortBy} />
        </div>
      </div>
 
      {loading ? (
        <p style={{ color: "#9ca3af" }}>Loading tasks...</p>
      ) : sorted.length === 0 ? (
        <p style={{ color: "#9ca3af" }}>
          {projectId ? "No tasks yet." : "Select a project to view tasks."}
        </p>
      ) : (
        <div style={styles.folderList}>
          {folders.map((folder) => (
            <FolderSection
              key={folder.id}
              title={folder.name}
              tasks={tasksByFolder[folder.id] ?? []}
              onTaskClick={setSelectedTask}
              onDelete={async () => {
                // unfolder all tasks in this folder before deleting
                const inFolder = tasks.filter((t) => t.folder_id === folder.id);
                await Promise.all(inFolder.map((t) => assignFolder(t.id, null)));
                await deleteFolder(folder.id);
              }}
            />
          ))}
          <FolderSection
            title="Uncategorized"
            tasks={unfoldered}
            onTaskClick={setSelectedTask}
            isUncategorized
          />
        </div>
      )}
 
      {selectedTask && (
        <TaskInfoModal
          task={selectedTask}
          user={user}
          isOwner={isOwner}
          folders={folders}
          onAssignFolder={handleAssignFolder}
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
  toolbarRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
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
  folderList: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  folderSection: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  folderHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  folderToggle: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px 0",
    fontSize: "15px",
    fontWeight: 700,
    color: "#111",
  },
  folderChevron: { fontSize: "12px", color: "#6b7280" },
  folderIcon: { fontSize: "16px" },
  folderName: { fontSize: "15px", fontWeight: 700 },
  folderCount: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    borderRadius: "999px",
    padding: "1px 8px",
    marginLeft: "2px",
  },
  folderDeleteBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#9ca3af",
    fontSize: "13px",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
  newFolderBtn: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  newFolderInputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  newFolderInput: {
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "7px 10px",
    fontSize: "13px",
    outline: "none",
    color: "#111",
    width: "160px",
  },
  newFolderConfirm: {
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "7px 12px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  newFolderCancel: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    padding: "7px 12px",
    fontSize: "13px",
    cursor: "pointer",
  },
};