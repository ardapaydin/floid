import { useUser } from "@/utils/api/users";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { UserAvatar } from "../User/Avatar";
import { useNavigate } from "react-router-dom";

export default function UserDropdownMenu({ children }: { children: React.ReactNode }) {
    const user = useUser();
    const nav = useNavigate()
    if (!user.data?.user) return;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
            <DropdownMenuContent className="py-4 px-6 border-0 w-64 bg-[#222121] mr-2">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm" onClick={() => nav("/users/" + user.data.user?.username)}>
                        <UserAvatar user={user.data.user} />
                        <div className="flex flex-col">
                            <p className="text-sm">View Profile</p>
                            <p className="text-white/50 text-xs">u/{user.data.user.username}</p>
                        </div>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}