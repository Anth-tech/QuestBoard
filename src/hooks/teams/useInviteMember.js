import { createClient } from "@/lib/client";
import { useState, useEffect } from "react";

const supabase = createClient();

export function useInviteMember(teamId, user) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

const sendInvite = async () => {
  if (!email || !teamId || !currentUser) {
    console.error("Missing email, teamId, or user");
    return;
  }

  setLoading(true);

  const normalizedEmail = email.toLowerCase();

  // Check if already invited
  const { data: existingInvite } = await supabase
    .from("team_invites")
    .select("id")
    .eq("team_id", teamId)
    .eq("email", normalizedEmail)
    .eq("status", "pending")
    .maybeSingle();

  if (existingInvite) {
    alert("User already invited");
    setLoading(false);
    return;
  }

  // Create invite (NO profile lookup)
  const { error } = await supabase
    .from("team_invites")
    .insert([
      {
        team_id: teamId,
        email: normalizedEmail,
        invited_by: currentUser.id,
        status: "pending",
      },
    ]);

  if (error) {
    console.error("Error sending invite:", error);
    alert("Error: " + error.message);
  } else {
    alert("Invite sent!");
    setEmail("");
    setShowModal(false);
  }

  setLoading(false);
};

  return {
    showModal,
    setShowModal,
    email,
    setEmail,
    sendInvite,
    loading,
  };
}
