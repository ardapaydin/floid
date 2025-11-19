import { UserAvatar } from "@/components/User/Avatar";
import type { User } from "@/types/user";

export default function UserPart({ user }: { user: User & { loading: boolean } }) {
    return (
        <>
            {(!user || user?.loading) && (
                <>
                    <div className="w-6 h-6 animate-pulse bg-[#333] rounded-full" />
                    <div className="w-20 h-2 animate-pulse bg-[#333] rounded" />
                </>
            ) || (
                    <>
                        <UserAvatar className="w-6 h-6" user={user} />
                        <h1>u/{user.username}</h1>
                    </>
                )}
        </>
    )
}