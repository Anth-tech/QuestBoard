import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/client";

const supabase = createClient();

//this hook fetches a specific post

export function useDiscussion(postId) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    if (!postId) {
      setPost(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("posts")
      .select(`id,
        title, 
        description, 
        created_at`)
      .eq("id", postId)
      .single();

    if (error) {
      console.error("Error fetching post:", error.message);
      setPost(null);
    } else {
      setPost(data);
    }

    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return { post, loading, refetch: fetchPost };
}