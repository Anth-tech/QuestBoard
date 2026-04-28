"use client";

import { createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const auth = useAuth();
  const projectData = useProjects(auth.user);

  return (
    <ProjectContext.Provider value={{ ...auth, ...projectData }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  return useContext(ProjectContext);
}