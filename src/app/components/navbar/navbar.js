"use client";

import Link from "next/link";
import LoginButton from "@/app/components/navbar/loginButton";
import LogoutButton from "@/app/components/navbar/logoutButton";
import FloatingActionButton from "@/app/components/navbar/floatingActionButton";
import CreateProjectModal from "@/app/components/navbar/createProjectModal";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProjectContext } from "@/app/context/ProjectContext";

export default function NavBar() {
  const {
    user, avatarUrl, displayName, initials,
    projects, selectedProject, setSelectedProject,
    showModal, setShowModal,
    newProjectName, setNewProjectName,
    newProjectDesc, setNewProjectDesc,
    handleCreateProject,
  } = useProjectContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdFromUrl = searchParams.get("project");
  
  useEffect(() => {
    if (projectIdFromUrl && projects.length > 0) {
      const found = projects.find(p => p.id === projectIdFromUrl);
      if (found && found.id !== selectedProject?.id) {
        setSelectedProject(found);
      }
    }
  }, [projectIdFromUrl, projects, selectedProject]);

  return (
    <aside style={styles.sidebar}>
      <div>
        <h2 style={styles.logo}>QuestBoard</h2>

        {/* Project Selector */}
        <div style={styles.projectBox}>
          <span style={styles.projectLabel}>Current Project</span>
          {projects.length > 0 ? (
            <select
              style={styles.projectSelect}
              value={selectedProject?.id ?? ""}
              onChange={(e) => {
                if (e.target.value === "__create__") {
                  setShowModal(true);
                  e.target.value = selectedProject?.id ?? "";
                  return;
                }
                const found = projects.find((p) => p.id === e.target.value);
                if (found) {
                  setSelectedProject(found);
                  router.push(`?project=${found.id}`);
                }
              }}
            >
              <option value="__create__">+ New Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <span style={styles.noProjects}>
                {user ? "No projects yet" : "Sign in to see projects"}
              </span>
              {user && (
                <button
                  onClick={() => setShowModal(true)}
                  style={styles.createFirstButton}
                >
                  + New Project
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal form for New Project */}
        <CreateProjectModal
          showModal={showModal}
          setShowModal={setShowModal}
          newProjectName={newProjectName}
          setNewProjectName={setNewProjectName}
          newProjectDesc={newProjectDesc}
          setNewProjectDesc={setNewProjectDesc}
          handleCreateProject={handleCreateProject}
        />

        <nav style={styles.nav}>
          <Link href={selectedProject ? `/charter?project=${selectedProject?.id}` : "/charter"} style={styles.link}>
            Project Charter
          </Link>
          <Link href={selectedProject ? `/tasks?project=${selectedProject?.id}` : "/tasks"} style={styles.link}>
            Tasks
          </Link>
          <Link href={selectedProject ? `/discussions?project=${selectedProject?.id}` : "/discussions"} style={styles.link}>
            Discussion Boards
          </Link>
          <Link href={"/teams"} style={styles.link}>
            Teams
          </Link>
        </nav>
      </div>

      <div style={styles.bottomSection}>
        <div style={styles.profile}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" style={styles.avatarImg} />
          ) : (
            <div style={styles.avatar}>{user ? initials : "?"}</div>
          )}
          <span>{user ? displayName : "Not signed in"}</span>
        </div>

        {user ? <LogoutButton /> : <LoginButton />}

        {/* <Link href="/settings" style={styles.link}>
          ⚙️ Settings
        </Link> */}
      </div>

      {/* Floating action button for project owner to create tasks/discussions */}
      <FloatingActionButton />
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "250px",
    height: "100vh",
    backgroundColor: "#111827",
    color: "white",
    padding: "20px",
    position: "fixed",
    left: 0,
    top: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  logo: {
    marginBottom: "20px",
    fontSize: "20px",
    fontWeight: "bold",
  },

  projectBox: {
    marginBottom: "25px",
    padding: "10px",
    backgroundColor: "#1f2937",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  projectLabel: { fontSize: "12px", color: "#9ca3af" },
  projectSelect: {
    backgroundColor: "#111827",
    color: "white",
    border: "1px solid #374151",
    borderRadius: "6px",
    padding: "4px 6px",
    fontSize: "14px",
    width: "100%",
    cursor: "pointer",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  noProjects: { fontSize: "13px", color: "#6b7280", fontStyle: "italic" },
  createFirstButton: {
    background: "none",
    border: "1px dashed #4b5563",
    color: "#9ca3af",
    borderRadius: "6px",
    padding: "4px 8px",
    fontSize: "13px",
    cursor: "pointer",
    textAlign: "left",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  link: {
    color: "#d1d5db",
    textDecoration: "none",
    fontSize: "16px",
  },
  bottomSection: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    borderTop: "1px solid #374151",
    paddingTop: "15px",
  },
  profile: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    backgroundColor: "#4b5563",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    flexShrink: 0,
  },
  avatarImg: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
  },
};
