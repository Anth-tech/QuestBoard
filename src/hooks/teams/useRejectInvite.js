import { createClient } from "@/lib/client";
import { useState } from "react";

const supabase = createClient();

export default function RejectInvite(user) {
    const rejectInvite = async (invite) => {
        await supabase
            .from('team_invites')
            .update({status: 'rejected'})
            .eq('id', invite.id);
    };
}