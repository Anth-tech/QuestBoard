import { createClient } from "@/lib/client";
import { useState, useEffect, useCallback } from "react";

const supabase = createClient();

export function usePendingInvites(user) {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = useCallback(async () => {
    if (!user?.email) {
      setInvites([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const normalizedEmail = user.email.toLowerCase();

    const { data, error } = await supabase
      .from("team_invites")
      .select(`
        id,
        team_id,
        status,
        teams (id, name)
      `)
      .eq("email", normalizedEmail)
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

  return {
    invites,
    loading,
    refetch: fetchInvites,
  };
}