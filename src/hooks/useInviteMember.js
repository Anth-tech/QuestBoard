import { createClient } from "@/lib/client";
import { useState, useEffect } from "react";

const supabase = createClient();

export default function InviteMemberForm(teamId, user) {
  const [email, setEmail] = useState("");

  const sendInvite = async () => {
    const { error } = await supabase.from("team_invites").insert([
      {
        team_id: teamId,
        email,
        invited_by: user.id,
        status: "pending"
      }
    ]);
    if (error) console.error(error);
    setEmail("");
  };

  return (
    <div>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Invite by email"
      />
      <button onClick={sendInvite}>Invite</button>
    </div>
  );
}
