"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import CreateTaskModal from "@/app/components/tasks/createTaskModal";
import CreateDiscussionModal from "@/app/components/discussions/createDiscussionModal";
import { useCreateTask } from "@/hooks/tasks/useCreateTask";
import { useCreateDiscussion } from "@/hooks/discussions/useCreateDiscussion";

export default function FloatingActionButton({ user, selectedProject }) {
  const [hovered, setHovered] = useState(false);
  const pathname = usePathname();

  // only shows up for owner of project, changes action based on whether they're viewing the task or discussions page
  const isOwner = user?.id === selectedProject?.owner_id;
  const isTasksPage = pathname.startsWith("/tasks");
    const isDiscussionsPage = pathname.startsWith("/discussions");
  const isValidPage = isTasksPage || isDiscussionsPage;

  const task = useCreateTask(selectedProject, user);
  const discussion = useCreateDiscussion(selectedProject);

  if (!isOwner || !isValidPage || !selectedProject) return null;

  // allows user to open modal for creating a task or discussion board based on the page that's opened
  const label = isTasksPage ? "+ Create Task" : "+ Create Discussion";
  const handleOpen = () => {
    if (isTasksPage) task.setShowModal(true);
    else if (isDiscussionsPage) discussion.setShowModal(true);
  };

  return (
    <>
      <button
        style={{
          ...styles.fab,
          width: hovered ? "220px" : "56px",
          borderRadius: hovered ? "28px" : "50%",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleOpen}
      >
        {hovered ? label : "+"}
      </button>

      {isTasksPage && <CreateTaskModal {...task} />}
      {isDiscussionsPage && <CreateDiscussionModal {...discussion} />}
    </>
  );
}

const styles = {
  fab: {
    position: "fixed",
    bottom: "32px",
    right: "32px",
    height: "56px",
    backgroundColor: "#3A3DED",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
    transition: "width 0.25s ease, border-radius 0.25s ease",
    overflow: "hidden",
    whiteSpace: "nowrap",
    zIndex: 999,
  },
};
