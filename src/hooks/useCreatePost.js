import { useState } from "react";
import { createClient } from "@/lib/client";

const supabase = createClient();

export function useCreatePost(selectedBoard, user, refetch) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleCreatePost = async () => {
    if (!selectedBoard || !title.trim()) return;

    const { data, error } = await supabase
      .from("posts")
      .insert({
        title: title.trim(),
        description: content.trim() || null,
        board_id: selectedBoard,
        author_id: user?.id,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating post:", error.message);
      return;
    }

    // reset form
    setTitle("");
    setContent("");
    setShowModal(false);

    await refetch();

    return data;
  };

  return {
    showModal,
    setShowModal,
    title,
    setTitle,
    content,
    setContent,
    handleCreatePost,
  };
}