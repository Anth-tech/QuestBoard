import { createClient } from "@/lib/client";
import { useState, useEffect } from "react";

export function useAcceptInvite(user) {
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  const acceptInvite = async (invite) => {
    if (!currentUser) {
      console.error("No user logged in");
      return;
    }

    const supabase = createClient();

    // Add user to team members
    const { error: memberError } = await supabase
      .from("team_members")
      .insert([
        {
          team_id: invite.team_id,
          user_id: currentUser.id,
          role: "member"
        }
      ]);

    if (memberError) {
      console.error("Error adding member:", memberError);
      alert("Error: " + memberError.message);
      return;
    }

    // Update invite status
    const { error: updateError } = await supabase
      .from("team_invites")
      .update({ status: "accepted" })
      .eq("id", invite.id);

    if (updateError) {
      console.error("Error updating invite:", updateError);
    }
  };

  return {
    acceptInvite,
  };
}