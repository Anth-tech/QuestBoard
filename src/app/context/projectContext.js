"use client";

import { createContext, useContext } from "react";
import { useProjects as useProjectsHook } from "@/hooks/useProjects";

const ProjectsContext = createContext(null);

export function ProjectsProvider({children }) {
  const projectsState = useProjectsHook(user);

  return (
    <ProjectsContext.Provider value={projectsState}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider");
  return ctx;
}