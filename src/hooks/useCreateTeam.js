import { createClient } from "@/lib/client";
import { useState } from "react";

const supabase = createClient();

export default function useCreateTeam(user) {
  const [teamName, setTeamName] = useState("");

  const handleCreate = async () => {
    if (!teamName) return;

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

    setTeamName('');
  };

  return (
    <div>
        <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Team name"
        />
        <button onClick={handleCreate}>Create Team</button>
    </div>
  );
}
