import { createClient } from "@/lib/client";

const supabase = createClient();

export function useTaskActions(user, refetch) {

  // allows current user to assign themselves to a task if they're not assigned
  const takeTask = async (task) => {
    const alreadyAssigned = task.task_assignees?.some(
      (a) => a.user_id === user?.id
    );

    if (!alreadyAssigned) {
      const { error } = await supabase
        .from("task_assignees")
        .insert({ task_id: task.id, user_id: user.id });
      if (error) { console.error("takeTask assignee:", error.message); return; }
    }

    const { error } = await supabase
      .from("tasks")
      .update({ status: "in_progress" })
      .eq("id", task.id);

    if (error) console.error("takeTask status:", error.message);
    else refetch();
  };

  // updates status to "In Progress"
  const updateStatus = async (taskId, status) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", taskId);

    if (error) console.error("updateStatus:", error.message);
    else refetch();
  };

  return { takeTask, updateStatus };
}