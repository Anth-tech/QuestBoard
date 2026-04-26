import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";

const supabase = createClient();

export function useCreateTask(selectedProject, user) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
  const [assignees, setAssignees] = useState([]);
  const [members, setMembers] = useState([]);
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    if (!selectedProject) return;

    // fetches all members in project
    const fetchMembers = async () => {
      const { data } = await supabase
        .from("project_members")
        .select("user_id, profiles(id, display_name)")
        .eq("project_id", selectedProject.id);

      // also includes the owner
      const { data: ownerData } = await supabase
        .from("profiles")
        .select("id, display_name")
        .eq("id", selectedProject.owner_id)
        .single();

      const memberList = data?.map((m) => m.profiles) ?? [];
      const all = ownerData
        ? [ownerData, ...memberList.filter((m) => m.id !== ownerData.id)]
        : memberList;

      setMembers(all);
    };

    fetchMembers();
  }, [selectedProject]);

  // allows assignees to be toggled
  const toggleAssignee = (id) => {
    setAssignees((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  // creates a task and inserts it into db
  const handleCreateTask = async () => {
    if (!title.trim() || !deadline) return;

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        deadline,
        project_id: selectedProject.id,
        reward: 0,
      })
      .select("id")
      .single();

    if (error) {
      console.error(error);
      return;
    }

    // insert assignees
    if (assignees.length > 0) {
      await supabase
        .from("task_assignees")
        .insert(assignees.map((user_id) => ({ task_id: task.id, user_id })));
    }

    setTitle("");
    setDescription("");
    setPriority("medium");
    setDeadline("");
    setAssignees([]);
    setAttachment(null);
    setShowModal(false);
  };

  return {
    showModal,
    setShowModal,
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    deadline,
    setDeadline,
    assignees,
    toggleAssignee,
    members,
    attachment,
    setAttachment,
    handleCreateTask,
  };
}
