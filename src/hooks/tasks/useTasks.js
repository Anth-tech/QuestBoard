import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";

const supabase = createClient();

export function useTasks(projectId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetches all tasks from the database
  const fetchTasks = async () => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        id, title, description, status, priority, reward, deadline,
        task_assignees ( user_id, profiles ( id, display_name ) )
      `,
      )
      .eq("project_id", projectId)
      .order("deadline", { ascending: true });

    if (error) { 
      console.error("useTasks:", error.message);
      setLoading(false); 
      return; 
    }

    // fetch attachment filenames from storage for each task
    const tasksWithAttachments = await Promise.all(
      (data ?? []).map(async (task) => {
        const { data: files } = await supabase.storage
          .from("task-attachments")
          .list(task.id);
        return { ...task, attachments: files?.map((f) => f.name) ?? [] };
      })
    );

    setTasks(tasksWithAttachments);
    setLoading(false);
  };

  // listens for when a new task is created and refreshes page
  useEffect(() => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    fetchTasks();

    const channel = supabase
      .channel(`tasks:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `project_id=eq.${projectId}`,
        },
        () => fetchTasks(),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [projectId]);

  return { tasks, loading, refetch: fetchTasks };
}
