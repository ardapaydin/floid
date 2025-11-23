import Loading from "@/components/Loading/Loading";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserAvatar } from "@/components/User/Avatar";
import type { User } from "@/types/user";
import { unblockUser, useBlockedUsers } from "@/utils/api/users";
import { useQueryClient } from "@tanstack/react-query";
import { Trash, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function BlockedUsers({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const blockedUsers = useBlockedUsers(isOpen);
    const qc = useQueryClient();
    const unblock = async (username: string, id: string) => {
        const r = await unblockUser(username);
        if (r.status == 200) {
            qc.setQueryData(["users", "me", "blocked"], (old: User[]) => (old.filter(x => x.username != username)))
            qc.setQueryData(["users", "me"], (old: { blocked: string[] }) => ({ ...old, blocked: old.blocked.filter(x => x != id) }))
        }
        else toast.error(r.data?.message)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogTitle className="font-medium text-xl">Blocked Users</DialogTitle>
                {blockedUsers.isLoading && <Loading />}
                <div className="flex flex-col justify-between max-h-96 bg-[#1d1c1c] gap-5 overflow-auto p-4 rounded-lg">
                    {!blockedUsers.isLoading && blockedUsers.data?.map((user) => (
                        <div className="flex justify-between w-full items-center">
                            <div className="flex gap-2 items-center">
                                <UserAvatar user={user} />
                                <h1>u/{user.username}</h1>
                            </div>

                            <Trash onClick={() => unblock(user.username, user.id)} className="cursor-pointer w-4.5 text-red-400" />
                        </div>
                    ))}

                    {(!blockedUsers.isLoading && !blockedUsers.data?.length) && (
                        <div className="flex flex-col justify-center items-center py-12 w-full">
                            <X className="w-12 text-red-400 h-12" />
                            <p className="text-white/80 mt-2">No blocked users</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}