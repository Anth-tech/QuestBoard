import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";

const supabase = createClient();

export function useDiscussionBoards(projectId) {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setBoards([]);
      return;
    }

    const fetchBoards = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("discussion_boards")
        .select("id, title")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching boards:", error.message);
        setBoards([]);
      } else {
        setBoards(data || []);
      }

      setLoading(false);
    };

    fetchBoards();

    // listens for new boards being inserted
    const channel = supabase
    .channel(`discussion_boards:${projectId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "discussion_boards",
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        if (payload.new.project_id === projectId) {
          setBoards((prev) => [...prev, payload.new]);
        }
      }
    ).subscribe();
    
    return () => supabase.removeChannel(channel);
  }, [projectId]);

  return { boards, loading };
}