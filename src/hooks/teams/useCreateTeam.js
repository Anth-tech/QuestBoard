import { createClient } from "@/lib/client";
import { useState, useEffect } from "react";

export default function useCreateTeam(user, project) {
  const [showModal, setShowModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  const handleCreateTeam = async () => {
    if (!teamName || !currentUser) {
      console.error("Missing team name or user");
      return;
    }

    // Create a fresh client to ensure we have the current session
    const supabase = createClient();
    
    // Refresh the session to ensure we have a valid token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
    }
    
    if (!session) {
      console.error("No session found");
      alert("Please sign in again");
      return;
    }

    const { data: team, error } = await supabase
      .from("teams")
      .insert([{ name: teamName, owner_id: currentUser.id, project_id: project }])
      .select()
      .single();

    if (error) {
      console.error("Error creating team:", error);
      alert("Error: " + error.message);
      return;
    }

    await supabase.from("team_members").insert([
      {
        team_id: team.id,
        user_id: currentUser.id,
        role: "owner",
      },
    ]);

    setTeamName("");
    setShowModal(false);
  };

  return {
    showModal,
    setShowModal,
    teamName,
    setTeamName,
    handleCreateTeam,
  };
}
