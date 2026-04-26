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
  }, [projectId]);

  return { boards, loading };
}