import { useState } from "react";
import { createClient } from "@/lib/client";

const supabase = createClient();

export function useCreateComment(postId, user, refetch) {
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState("");

  const handleCreateComment = async () => {
    if (!postId || !content.trim() || !user?.id) return;

    const { data, error } = await supabase
      .from("post_comments")
      .insert({
        post_id: postId,
        author_id: user.id,
        content: content.trim(),
      })
      .select(`
        id,
        content,
        created_at,
        profiles:author_id (
          display_name
        )
      `)
      .single();

    if (error) {
      console.error("Error creating comment:", error.message);
      return;
    }

    // reset form
    setContent("");
    setShowModal(false);

    // refresh comments list
    if (refetch) {
      await refetch();
    }

    return data;
  };

  return {
    showModal,
    setShowModal,
    content,
    setContent,
    handleCreateComment,
  };
}