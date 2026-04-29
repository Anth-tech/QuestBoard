"use client";

import { useState } from "react";
import useCreateTeam from "@/hooks/teams/useCreateTeam";
import { useTeamList, useTeamMembers } from "@/hooks/teams/useTeamList";
import { useAuth } from "@/hooks/useAuth";
import { useInviteMember } from "@/hooks/teams/useInviteMember";
import { useAcceptInvite } from "@/hooks/teams/useAcceptInvite";
import { useRejectInvite } from "@/hooks/teams/useRejectInvite";
import { usePendingInvites } from "@/hooks/teams/usePendingInvites";
import { useSearchParams } from "next/navigation";
import CreateTeamModal from "@/app/components/teams/createTeamModal";
import InviteMemberModal from "@/app/components/teams/inviteMemberModal";

export default function TeamsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const project = searchParams.get("project");
  const { teams, loading, refetch } = useTeamList(user);
  const createTeam = useCreateTeam(user,project);
  const { invites, loading: invitesLoading, refetch: refetchInvites } = usePendingInvites(user);
  const acceptInvite = useAcceptInvite(user);
  const rejectInvite = useRejectInvite(user);

  const [openTeamId, setOpenTeamId] = useState(null);
  const toggleTeam = (teamId) => {
    setOpenTeamId((prev) => (prev === teamId ? null : teamId));
  };

  const selectedTeam = teams.find((t) => t.id === openTeamId) || null;
  const { members, loading: membersLoading } = useTeamMembers(openTeamId);
  
  // Get the current user's role in the selected team
  const currentUserMember = selectedTeam ? members.find(m => m.user_id === user?.id) : null;
  const isOwner = currentUserMember?.role === "owner";
  
  const inviteMember = useInviteMember(openTeamId, user);

  const handleAcceptInvite = async (invite) => {
    await acceptInvite.acceptInvite(invite);
    refetchInvites();
    refetch();
  };

  const handleRejectInvite = async (invite) => {
    await rejectInvite.rejectInvite(invite);
    refetchInvites();
  };

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

      {/* Pending Invites Section */}
      {invites.length > 0 && (
        <div style={styles.invitesSection}>
          <h3 style={styles.sectionTitle}>Pending Invites</h3>
          {invites.map((invite) => (
            <div key={invite.id} style={styles.inviteItem}>
              <span style={styles.inviteTeamName}>
                Invitation to: {invite.teams?.name}
              </span>
              <div style={styles.inviteActions}>
                <button
                  style={styles.acceptButton}
                  onClick={() => handleAcceptInvite(invite)}
                >
                  Accept
                </button>
                <button
                  style={styles.rejectButton}
                  onClick={() => handleRejectInvite(invite)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
                    {isOwner && (
                      <button
                        style={styles.inviteButton}
                        onClick={() => inviteMember.setShowModal(true)}
                      >
                        + Invite Member
                      </button>
                    )}
                    {membersLoading ? (
                      <p style={{ color: "#9ca3af" }}>Loading members...</p>
                    ) : members.length === 0 ? (
                      <p style={{ color: "#9ca3af" }}>No members yet.</p>
                    ) : (
                      members.map((member) => (
                        <div key={member.profiles?.id || member.user_id} style={styles.memberItem}>
                          <span style={styles.memberName}>
                            {member.profiles?.display_name || member.users?.email || "Unknown User"}
                          </span>
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

      <InviteMemberModal
        showModal={inviteMember.showModal}
        setShowModal={inviteMember.setShowModal}
        email={inviteMember.email}
        setEmail={inviteMember.setEmail}
        sendInvite={inviteMember.sendInvite}
        loading={inviteMember.loading}
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
  invitesSection: {
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: "#fef3c7",
    borderRadius: "6px",
    border: "1px solid #f59e0b",
  },
  sectionTitle: {
    color: "#92400e",
    marginBottom: "10px",
    fontSize: "16px",
  },
  inviteItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    backgroundColor: "white",
    borderRadius: "4px",
    marginBottom: "8px",
  },
  inviteTeamName: {
    color: "#374151",
    fontWeight: "500",
  },
  inviteActions: {
    display: "flex",
    gap: "8px",
  },
  acceptButton: {
    padding: "6px 12px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  rejectButton: {
    padding: "6px 12px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  inviteButton: {
    padding: "8px 16px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "10px",
  },
};
