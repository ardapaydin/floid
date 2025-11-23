import BanDetails from "@/components/Dialogs/Community/Ban/Details";
import Loading from "@/components/Loading/Loading";
import { UserAvatar } from "@/components/User/Avatar";
import { useBannedMembers } from "@/utils/api/members";
import { Ban } from "lucide-react";
import { useParams } from "react-router-dom"

export default function BansPage() {
    const { name } = useParams();
    const banned = useBannedMembers(name!);
    return (
        <div className="flex flex-col flex-1 min-h-full">
            {banned.isLoading && <Loading />}
            {(!banned.isLoading && Array.isArray(banned.data)) && (
                <div className="space-y-4">
                    <div className="flex my-4">
                        <h1 className="text-2xl font-bold">Bans</h1>
                    </div>

                    <div className="flex flex-col gap-2">
                        {banned?.data?.map((ban) => (
                            <BanDetails ban={ban}>
                                <div className="flex w-full cursor-pointer bg-[#3d3d3d] px-4 py-2 items-center justify-between p-2 rounded-lg">
                                    <div className="flex gap-2 items-center">
                                        <UserAvatar user={ban.banned} />
                                        <h1 className="text-sm">u/{ban.banned.username}</h1>
                                    </div>
                                </div>
                            </BanDetails>
                        ))}

                        {!banned.data?.length && (
                            <div className="mt-32 flex flex-col gap-4 justify-center items-center">
                                <Ban className="w-32 h-32 text-red-500" />
                                <h1 className="font-bold text-2xl">This community doesn't have any banned users yet</h1>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}