import { createClient } from "@/lib/client";
import { useState, useEffect, useCallback } from "react";

const supabase = createClient();

export function useTeamList(user) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = useCallback(async () => {
    if (!user) {
      setTeams([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("team_members")
      .select("team_id, teams (id, name)")
      .eq("user_id", user.id);

    if (!error) {
      setTeams(data.map((t) => t.teams));
    } else {
      console.error(error);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const refetch = () => {
    fetchTeams();
  };

  return {
    teams,
    loading,
    refetch,
  };
}

export function useTeamMembers(teamId) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!teamId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("team_members")
      .select(
        `
        user_id,
        role,
        profiles (
          id, display_name
        )
      `
      )
      .eq("team_id", teamId);

    if (!error) {
      setMembers(data);
    } else {
      console.error(error);
    }

    setLoading(false);
  }, [teamId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const refetch = () => {
    fetchMembers();
  };

  return {
    members,
    loading,
    refetch,
  };
}
