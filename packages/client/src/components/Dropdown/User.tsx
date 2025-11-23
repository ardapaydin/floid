import { useUser } from "@/utils/api/users";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { UserAvatar } from "../User/Avatar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { LogOut, Settings } from "lucide-react";
import { logout } from "@/utils/api/auth";
import { removeToken } from "@/utils/auth/user";

export default function UserDropdownMenu({ children }: { children: React.ReactNode }) {
    const user = useUser();
    const nav = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const logoutfunc = async () => {
        const r = await logout();
        if (r.status == 200) {
            removeToken();
            window.location.href = "/"
        }
    }

    if (!user.data?.user) return;
    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
            <DropdownMenuContent className="border-0 w-64 py-2 bg-[#222121] mr-2">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[#333]/50 transition-all px-4 py-4 rounded-lg" onClick={() => {
                        nav("/u/" + user.data.user?.username)
                        setIsOpen(false)
                    }}>
                        <UserAvatar user={user.data.user} />
                        <div className="flex flex-col">
                            <p className="text-sm text-white">View Profile</p>
                            <p className="text-white/50 text-xs">u/{user.data.user.username}</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[#333]/50 transition-all px-4 py-4 rounded-lg" onClick={() => {
                        nav("/settings/account")
                        setIsOpen(false)
                    }}>
                        <Settings className="text-white" />
                        <div className="flex flex-col">
                            <p className="text-sm text-white">Settings</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[#333]/50 transition-all px-4 py-2 rounded-lg" onClick={() => {
                        logoutfunc()
                    }}>
                        <LogOut className="text-white" />
                        <div className="flex flex-col">
                            <p className="text-sm text-white">Logout</p>
                        </div>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}