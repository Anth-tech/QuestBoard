import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";

const supabase = createClient();

export function useDiscussions(boardId) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!boardId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("posts")
        .select("id, title, board_id")
        .eq("board_id", boardId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error.message);
        setPosts([]);
      } else {
        setPosts(data || []);
      }

      setLoading(false);
    };

    fetchPosts();
  }, [boardId]);

  return { posts, loading };
}