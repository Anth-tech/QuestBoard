"use client";

import { useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useTaskActions } from "@/hooks/tasks/useTaskActions";
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

  // converts tasks to calendar events
  const events = useMemo(() => {
    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      start: new Date(task.deadline),
      end: new Date(new Date(task.deadline).getTime() + 60 * 60 * 1000), 
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
};