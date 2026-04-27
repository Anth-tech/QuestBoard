import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";

const supabase = createClient();

export function useCreateDiscussion(selectedProject) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!selectedProject) return;

    // fetches all members in project
    const fetchMembers = async () => {
      const { data } = await supabase
        .from("project_members")
        .select("user_id, profiles(id, display_name)")
        .eq("project_id", selectedProject.id);

      setMembers(data?.map((m) => m.profiles) ?? []);
    };

    fetchMembers();
  }, [selectedProject]);

  // allows team members to be toggled on whether they should be allowed to view a private discussion board
  const toggleUser = (id) => {
    setAllowedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id],
    );
  };

  const handleCreateDiscussion = async () => {
    if (!title.trim()) return;

    const { error } = await supabase.from("discussion_boards").insert({
      title: title.trim(),
      is_private: isPrivate,
      project_id: selectedProject.id,
    });

    if (error) {
      console.error("code:", error.code);
      console.error("message:", error.message);
      return;
    }

    // insert allowed users for private boards
    if (isPrivate && allowedUsers.length > 0) {
      const { data: board } = await supabase
        .from("discussion_boards")
        .select("id")
        .eq("project_id", selectedProject.id)
        .eq("title", title.trim())
        .single();

      if (board) {
        await supabase
          .from("discussion_board_members")
          .insert(
            allowedUsers.map((user_id) => ({ board_id: board.id, user_id })),
          );
      }
    }

    setTitle("");
    setIsPrivate(false);
    setAllowedUsers([]);
    setShowModal(false);
  };

  return {
    showModal,
    setShowModal,
    title,
    setTitle,
    isPrivate,
    setIsPrivate,
    allowedUsers,
    toggleUser,
    members,
    handleCreateDiscussion,
  };
}
