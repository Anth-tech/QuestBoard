import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
const supabase = createClient();

export function useProjects(user) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  useEffect(() => {
    // no point in fetching if user isn't signed in
    if (!user) {
      setProjects([]);
      setSelectedProject(null);
      return;
    }

    const fetchProjects = async () => {
      // projects user owns or is a member of are fetched;
      const { data: owned } = await supabase
        .from("projects")
        .select("id, name")
        .eq("owner_id", user.id);

      const { data: memberships } = await supabase
        .from("project_members")
        .select("project_id, projects(id, name)")
        .eq("user_id", user.id);

      // memberships needs to be mapped to remove unneccessary data since we only care about the project
      const memberProjects = memberships?.map((m) => m.projects) ?? [];
      const ownedProjects = owned ?? [];

      // spreads all owned/member projects into a combined array, which is then mapped
      const all = [...ownedProjects, ...memberProjects];
      const unique = Array.from(new Map(all.map((p) => [p.id, p])).values());

      setProjects(unique);
      if (unique.length > 0) setSelectedProject(unique[0]);
    };

    fetchProjects();
  }, [user]); // re-fetches whenever the user changes (sign in/out)

  // handles creating a new project using a modal
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    const { error } = await supabase.from("projects").insert({
      name: newProjectName,
      description: newProjectDesc.trim() || null,
      owner_id: user.id,
    });

    console.log("error:", error);

    if (!error) {
      // refetch full list so new project's id is included
      const { data: owned } = await supabase
        .from("projects")
        .select("id, name")
        .eq("owner_id", user.id);

      const newProject = owned?.find((p) => p.name === newProjectName);
      setProjects((prev) => [...prev, newProject]);
      setSelectedProject(newProject);
      setNewProjectName("");
      setNewProjectDesc("");
      setShowModal(false);
    }
  };

  return {
    projects,
    selectedProject,
    setSelectedProject,
    showModal,
    setShowModal,
    newProjectName,
    setNewProjectName,
    newProjectDesc,
    setNewProjectDesc,
    handleCreateProject,
  };
}
