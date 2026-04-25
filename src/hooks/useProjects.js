import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";

export function useProjects(user) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const supabase = createClient();

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

  return { projects, selectedProject, setSelectedProject };
}
