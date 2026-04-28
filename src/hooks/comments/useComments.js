import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/client";

const supabase = createClient();

export function usePostComments(postId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!postId) {
      setComments([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("post_comments")
      .select(`
        id,
        content,
        created_at,
        profiles:author_id (
          display_name
        )
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error.message);
      setComments([]);
    } else {
      setComments(data);
    }

    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, loading, refetch: fetchComments };
}