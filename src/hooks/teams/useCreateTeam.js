import { createClient } from "@/lib/client";
import { useState } from "react";

const supabase = createClient();

export default function useCreateTeam(user) {
  const [showModal, setShowModal] = useState(false);
  const [teamName, setTeamName] = useState("");

  const handleCreateTeam = async () => {
    if (!teamName || !user) return;

    const { data: team, error } = await supabase
      .from("teams")
      .insert([{ name: teamName, owner_id: user?.id }])
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    await supabase.from("team_members").insert([
      {
        team_id: team.id,
        user_id: user.id,
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
