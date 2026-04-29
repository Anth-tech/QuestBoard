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
    
    // First, find the user by email
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !userData) {
      console.error("User not found with that email");
      alert("No user found with that email");
      setLoading(false);
      return;
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", teamId)
      .eq("user_id", userData.id)
      .single();

    if (existingMember) {
      alert("User is already a member of this team");
      setLoading(false);
      return;
    }

    // Create the invite
    const { error } = await supabase
      .from("team_invites")
      .insert([
        {
          team_id: teamId,
          user_id: userData.id,
          invited_by: currentUser.id,
          status: "pending"
        }
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
