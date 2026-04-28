import { createClient } from "@/lib/client";
import { useState, useEffect } from "react";

const supabase = createClient();

export default function useCreateTeam(user) {
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

    const { data: team, error } = await supabase
      .from("teams")
      .insert([{ name: teamName, owner_id: currentUser.id }])
      .select()
      .single();

    if (error) {
      console.error("Error creating team:", error);
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
