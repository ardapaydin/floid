import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Community } from "@/types/community";
import type { User } from "@/types/user";
import { useState } from "react";

export function BanMember({ children, member, community }: { children: React.ReactNode, member: User, community: Community }) {
    const [form, setForm] = useState({
        reason: "",
        expiresAt: "30d" as string | null
    })
    return (
        <Dialog>
            <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>{children}</DialogTrigger>
            <DialogContent>
                <DialogTitle className="font-medium text-xl">Ban {member.username}</DialogTitle>
            </DialogContent>
        </Dialog>
    )
}