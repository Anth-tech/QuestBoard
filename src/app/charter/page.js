"use client";
 
import { useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useTaskActions } from "@/hooks/tasks/useTaskActions";
import { useDeadlineAlerts } from "@/hooks/charter/useDeadlineAlerts";
import { useProjectContext } from "@/app/context/ProjectContext";
import TaskInfoModal from "@/app/components/tasks/taskInfoModal";
import "react-big-calendar/lib/css/react-big-calendar.css";
 
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { "en-US": enUS },
});
 
const PRIORITY_COLOR = {
  urgent: "#dc2626",
  high: "#ea580c",
  medium: "#2563eb",
  low: "#16a34a",
  optional: "#9ca3af",
};
 
/** DeadlineModalpopup listing all tasks due in 0, 1, or 2 days. auto-shown on page load by useDeadlineAlerts.
   @param {Array} alerts - alert objects from useDeadlineAlerts
   @param {Function} onClose - closes the modal
 */
function DeadlineModal({ alerts, onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}> Upcoming Deadlines</h2>
        <p style={styles.modalSubtitle}>
          You have {alerts.length} task{alerts.length > 1 ? "s" : ""} due soon.
        </p>
 
        <div style={styles.alertList}>
          {alerts.map(({ task, icon, label, bg, border, color }) => (
            <div
              key={task.id}
              style={{ ...styles.alertRow, backgroundColor: bg, border: `1px solid ${border}`, color }}
            >
              <span style={styles.alertIcon}>{icon}</span>
              <div>
                <div style={styles.alertLabel}>{label}</div>
                <div style={styles.alertTitle}>{task.title}</div>
              </div>
            </div>
          ))}
        </div>
 
        <button style={styles.dismissBtn} onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
 
export default function CalendarPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");

  const { user, selectedProject } = useProjectContext();
  const { tasks, loading, refetch } = useTasks(projectId);
  const { takeTask, updateStatus } = useTaskActions(user, refetch);
  const isOwner = user?.id === selectedProject?.owner_id;
 
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
 
  // auto-shows deadline modal when page loads with upcoming tasks
  const { alerts, showModal, closeModal } = useDeadlineAlerts(tasks, loading);
 
  // converts tasks to calendar events
  const events = useMemo(() => {
    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      start: new Date(task.deadline.slice(0, 10) + "T00:00:00"),
      end: new Date(task.deadline.slice(0, 10) + "T01:00:00"),
      // jerry rig fix to add a new duration so box isn't crunched up that only half works
      resource: task, // stores full task for click handler
    }));
  }, [tasks]);
 
  // colors events by their priority
  const eventStyleGetter = (event) => {
    const priority = event.resource?.priority ?? "medium";
    const isCompleted = event.resource?.status === "completed";
    return {
      style: {
        backgroundColor: isCompleted ? "#9ca3af" : PRIORITY_COLOR[priority],
        borderRadius: "4px",
        border: "none",
        color: "white",
        fontSize: "12px",
        padding: "2px 6px",
        opacity: isCompleted ? 0.6 : 1,
      },
    };
  };
 
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Calendar</h1>
 
      {loading ? (
        <p style={{ color: "#9ca3af" }}>Loading...</p>
      ) : !projectId ? (
        <p style={{ color: "#9ca3af" }}>Select a project to view deadlines.</p>
      ) : (
        <div style={styles.calendarWrapper}>
          <Calendar
            localizer={localizer}
            events={events}
            view={view}
            date={date}
            onView={setView}
            onNavigate={setDate}
            eventPropGetter={eventStyleGetter}
            views={["month", "week", "day", "agenda"]}
            style={{ height: "75vh" }}
            onSelectEvent={(event) => setSelectedTask(event.resource)}
          />
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
        />
      )}
 
      {/* deadline modal — auto-shown once on load if upcoming tasks exist */}
      {showModal && <DeadlineModal alerts={alerts} onClose={closeModal} />}
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
  heading: { fontSize: "24px", fontWeight: 700, marginBottom: "20px" },
  calendarWrapper: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
    maxWidth: "460px",
    margin: "0 16px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: 700,
    margin: "0 0 6px",
    textAlign: "center",
    color: "#111",
  },
  modalSubtitle: {
    fontSize: "13px",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: "20px",
  },
  alertList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
  },
  alertRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 14px",
    borderRadius: "6px",
  },
  alertIcon: { fontSize: "18px", flexShrink: 0 },
  alertLabel: { fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
  alertTitle: { fontSize: "14px", fontWeight: 600, marginTop: "2px" },
  dismissBtn: {
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