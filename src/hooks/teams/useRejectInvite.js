import { createClient } from "@/lib/client";
import { useState, useEffect } from "react";

export function useRejectInvite(user) {
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  const rejectInvite = async (invite) => {
    if (!currentUser) {
      console.error("No user logged in");
      return;
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("team_invites")
      .update({ status: "rejected" })
      .eq("id", invite.id);

    if (error) {
      console.error("Error rejecting invite:", error);
      alert("Error: " + error.message);
    }
  };

  return {
    rejectInvite,
  };
}