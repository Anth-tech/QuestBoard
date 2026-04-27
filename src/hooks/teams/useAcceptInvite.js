import { createClient } from "@/lib/client";
import { useState } from "react";

const supabase = createClient();

export default function AcceptInvite(user) {
    const acceptInvite = async (invite) => {
        await supabase
        .from('team_members')
        .insert([
            {
                team_id: invite.team_id,
                user_id: user.id,
                role: 'member'
            }
        ]);

        await supabase
            .from('team_invites')
            .update({status: 'accepted'})
            .eq('id', invite.id);
    };
}