import Loading from "@/components/Loading/Loading";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserAvatar } from "@/components/User/Avatar";
import { useMembersSearch } from "@/utils/api/members";
import { Search } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

export function AddModerator({ children }: { children: React.ReactNode }) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const { name } = useParams();
    const members = useMembersSearch(name!, isOpen ? query : null)
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

                    <div className="flex flex-col max-h-96 overflow-auto">
                        {members.isLoading && <Loading /> || members.data?.map((member) => (
                            <div className="flex items-center gap-2">
                                <UserAvatar user={member} />
                                <h1>{member.displayName}</h1>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}