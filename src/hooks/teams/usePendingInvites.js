import { createClient } from "@/lib/client";
import { useState, useEffect, useCallback } from "react";

const supabase = createClient();

export function usePendingInvites(user) {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = useCallback(async () => {
    if (!user) {
      setInvites([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("team_invites")
      .select("id, team_id, status, teams (id, name)")
      .eq("user_id", user.id)
      .eq("status", "pending");

    if (!error) {
      setInvites(data);
    } else {
      console.error("Error fetching invites:", error);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const refetch = () => {
    fetchInvites();
  };

  return {
    invites,
    loading,
    refetch,
  };
}