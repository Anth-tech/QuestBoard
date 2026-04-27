import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/client";

const supabase = createClient();

export function useDiscussions(boardId) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!boardId) {
      setPosts([]);
      setLoading(false);
      return;
    }

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
  }, [boardId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, refetch: fetchPosts };
}