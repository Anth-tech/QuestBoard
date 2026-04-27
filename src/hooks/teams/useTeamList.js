import { createClient } from "@/lib/client";
import { useState, useEffect } from "react";

const supabase = createClient();

export default function TeamList(user) {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchRouteOnCacheMiss();
  }, []);

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from("team_members")
      .select("team_id, teams (id, name)")
      .eq("user_id", user.id);
    if (!error) {
      setTeams(data.map((t) => t.teams));
    }
  };

  return (
    <div>
      <h3>Your Teams</h3>
      {teams.map((team) => (
        <div key={teams.id}>{teams.name}</div>
      ))}
    </div>
  );
}
