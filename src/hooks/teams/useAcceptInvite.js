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
    
    //add the user to the project
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("project_id")
      .eq("id", invite.team_id)
      .single();

    if (teamError || !team?.project_id) {
      console.error("Error fetching team project:", teamError);
      return;
    }

    const { error: projectMemberError } = await supabase
      .from("project_members")
      .insert([
        {
          project_id: team.project_id,
          user_id: currentUser.id,
        },
      ]);

    if (projectMemberError) {
      console.error("Error adding to project:", projectMemberError);
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