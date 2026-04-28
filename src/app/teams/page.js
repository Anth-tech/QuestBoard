"use client";

import { useState } from "react";
import useCreateTeam  from "@/hooks/teams/useCreateTeam";
import { useTeamList, useTeamMembers } from "@/hooks/teams/useTeamList";
import { useAuth } from "@/hooks/useAuth";
import CreateTeamModal from "@/app/components/teams/createTeamModal";

export default function TeamsPage() {
  const { user } = useAuth();
  const { teams, loading, refetch } = useTeamList(user);
  const createTeam = useCreateTeam(user);

  const [openTeamId, setOpenTeamId] = useState(null);
  const toggleTeam = (teamId) => {
    setOpenTeamId((prev) => (prev === teamId ? null : teamId));
  };

  const selectedTeam = teams.find((t) => t.id === openTeamId) || null;
  const { members, loading: membersLoading } = useTeamMembers(openTeamId);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Teams</h1>

        <button
          style={styles.button}
          onClick={() => {
            if (!user) {
              alert("Please sign in to create a team");
              return;
            }
            createTeam.setShowModal(true);
          }}
        >
          + Create New Team
        </button>
      </div>

      <div style={styles.teamList}>
        <h3>Your Teams</h3>
        {loading ? (
          <p style={{ color: "#9ca3af" }}>Loading teams...</p>
        ) : teams.length === 0 ? (
          <p style={{ color: "#9ca3af" }}>No Teams yet.</p>
        ) : (
          teams.map((team) => {
            const isOpen = openTeamId === team.id;

            return (
              <div key={team.id} style={styles.teamWrapper}>
                <button
                  onClick={() => toggleTeam(team.id)}
                  style={{
                    ...styles.teamHeader,
                    ...(isOpen ? styles.teamHeaderOpen : {}),
                  }}
                >
                  <span>{team.name}</span>
                  <span>{isOpen ? "−" : "+"}</span>
                </button>

                {isOpen && (
                  <div style={styles.teamContent}>
                    {membersLoading ? (
                      <p style={{ color: "#9ca3af" }}>Loading members...</p>
                    ) : members.length === 0 ? (
                      <p style={{ color: "#9ca3af" }}>No members yet.</p>
                    ) : (
                      members.map((member) => (
                        <div key={member.profiles.id} style={styles.memberItem}>
                          <span style={styles.memberName}>{member.profiles.display_name}</span>
                          <span style={styles.memberRole}>{member.role}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <CreateTeamModal
        showModal={createTeam.showModal}
        setShowModal={createTeam.setShowModal}
        teamName={createTeam.teamName}
        setTeamName={createTeam.setTeamName}
        handleCreateTeam={createTeam.handleCreateTeam}
      />
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  teamList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  teamWrapper: {
    borderRadius: "6px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  teamHeader: {
    width: "100%",
    backgroundColor: "#1f2937",
    color: "white",
    padding: "15px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "16px",
  },
  teamHeaderOpen: {
    backgroundColor: "#374151",
  },
  teamContent: {
    padding: "15px",
    backgroundColor: "#f9fafb",
    borderTop: "1px solid #e5e7eb",
  },
  memberItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    backgroundColor: "white",
    borderRadius: "4px",
    marginBottom: "8px",
  },
  memberName: {
    color: "#374151",
  },
  memberRole: {
    color: "#6b7280",
    fontSize: "14px",
    textTransform: "capitalize",
  },
};
