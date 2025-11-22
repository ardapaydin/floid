import Loading from "@/components/Loading/Loading";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserAvatar } from "@/components/User/Avatar";
import { cn } from "@/lib/utils";
import { useCommunityByName } from "@/utils/api/community";
import { useMembersSearch } from "@/utils/api/members";
import { setMemberRole, useRoleMembers } from "@/utils/api/roles";
import { useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

export function AddModerator({ children }: { children: React.ReactNode }) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const { name } = useParams();
    const moderators = useRoleMembers(name!, "mod");
    const community = useCommunityByName(name!);
    const members = useMembersSearch(name!, isOpen ? query : null)
    const [user, setUserId] = useState("");
    const qc = useQueryClient();
    const add = async () => {
        const r = await setMemberRole(name!, user, "mod");
        if (r.status == 200) {
            setIsOpen(false);
            setQuery("");
            setUserId("");
            qc.invalidateQueries({ queryKey: ["communities", name, "roles", "mod", "members"] })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="bg-[#242424]">
                <DialogTitle>
                    Add Moderator
                </DialogTitle>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center bg-[#333] px-2 rounded-lg">
                        <Search />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search members"
                            className="px-2 py-2 w-full rounded-lg bg-[#333] text-white focus:outline-none transition"
                        />
                    </div>

                    <div className="flex flex-col max-h-96 overflow-auto bg-[#111]/50 rounded-lg p-2">
                        {members.isLoading && <Loading /> || members.data?.filter(x => !moderators.data?.find(r => x.id == r.id) && community.data?.creator != x.id).map((member) => (
                            <div className={cn("flex items-center gap-2 p-2 rounded-lg hover:bg-[#222] cursor-pointer", user == member.id ? "bg-[#222]" : "")} onClick={() => setUserId(member.id)}>
                                <UserAvatar user={member} />
                                <div className="flex flex-col">
                                    <h1>{member.displayName}</h1>
                                    <p className="text-muted-foreground text-xs">u/{member.username}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="w-full border-[#333] border-t justify-end flex">
                        <button
                            onClick={() => add()}
                            disabled={!user}
                            className="mt-4 px-4 justify-center items-center flex disabled:opacity-50 disabled:hover:bg-orange-500 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                            Add
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}