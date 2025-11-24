import { UserAvatar } from "@/components/User/Avatar";
import type { User } from "@/types/user";
import { useNavigate } from "react-router-dom";
import { FlairView } from "../../Common/Member/Flair";
import type { Flair } from "@/types/flair";

export default function UserPart({ user }: { user: User & { loading: boolean, flair: Flair } }) {
    const nav = useNavigate();
    return (
        <div className="cursor-pointer flex gap-2 items-center hover:text-white transition" onClick={() => nav("/u/" + user.username)}>
            {(!user || user?.loading) && (
                <>
                    <div className="w-6 h-6 animate-pulse bg-[#333] rounded-full" />
                    <div className="w-20 h-2 animate-pulse bg-[#333] rounded" />
                </>
            ) || (
                    <>
                        <UserAvatar className="w-6 h-6" user={user} />
                        <h1>u/{user.username}</h1>
                        <FlairView flair={user?.flair} />
                    </>
                )}
        </div>
    )
}