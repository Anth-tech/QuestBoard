import { useState, useEffect } from "react";
 
const ALERT_STYLE = {
  0: { border: "#fca5a5", color: "#991b1b", bg: "#fef2f2", icon: "🔴", label: "Due today" },
  1: { border: "#fcd34d", color: "#92400e", bg: "#fffbeb", icon: "🟡", label: "Due tomorrow" },
  2: { border: "#93c5fd", color: "#1e40af", bg: "#eff6ff", icon: "🔵", label: "Due in 2 days" },
};
 
export function useDeadlineAlerts(tasks, loading) {
  const [alerts, setAlerts] = useState([]);
  const [showModal, setShowModal] = useState(false);
 
  useEffect(() => {
    if (loading || tasks.length === 0) return;
 
    // checks each task's deadline against today and collects those due in 0, 1, or 2 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
 
    const found = [];
 
    tasks.forEach((task) => {
      if (!task.deadline || task.status === "completed") return;
 
      const deadline = new Date(task.deadline);
      deadline.setHours(0, 0, 0, 0);
 
      const daysUntil = Math.round((deadline - today) / (1000 * 60 * 60 * 24));
      if (![0, 1, 2].includes(daysUntil)) return;
 
      found.push({ task, daysUntil, ...ALERT_STYLE[daysUntil] });
    });
 
    // sort by urgency — today first
    found.sort((a, b) => a.daysUntil - b.daysUntil);
 
    if (found.length > 0) {
      setAlerts(found);
      setShowModal(true);
    }
  }, [loading, tasks]);
 
  return { alerts, showModal, closeModal: () => setShowModal(false) };
}
