import { AddModerator } from "@/components/Dialogs/Moderator/Add";
import Loading from "@/components/Loading/Loading";
import { UserAvatar } from "@/components/User/Avatar";
import { cn } from "@/lib/utils";
import type { User } from "@/types/user";
import { useCommunityByName } from "@/utils/api/community";
import { setMemberRole, useRoleMembers } from "@/utils/api/roles";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldHalf, Trash } from "lucide-react";
import { useParams } from "react-router-dom"

export function ModeratorsPage() {
    const { name } = useParams();
    const community = useCommunityByName(name!);
    const moderators = useRoleMembers(name!, "mod")
    const qc = useQueryClient();
    const deleteMod = async (memberId: string) => {
        const r = await setMemberRole(name!, memberId, "member");
        if (r.status == 200) qc.setQueryData(["communities", name, "roles", "mod", "members"], (old: User[]) => (old.filter(x => x.id != memberId)))
    }

    return (
        <div className="flex flex-col">
            {moderators.isLoading && <Loading /> || (
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between">
                        <h1 className="text-2xl font-bold">
                            Moderators
                        </h1>
                        <AddModerator>
                            <div className="px-2 justify-center items-center flex disabled:opacity-50 disabled:hover:bg-orange-500 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-1 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                                Add Moderator
                            </div>
                        </AddModerator>
                    </div>

                    {(Array.isArray(moderators.data) && !moderators.data.length) && (
                        <div className="mt-32 flex flex-col gap-4 justify-center items-center">
                            <ShieldHalf className="w-32 h-32 text-red-500" />
                            <h1 className="font-bold text-2xl">{community.data?.name} community doesn't have any moderators yet</h1>
                            <AddModerator>
                                <button
                                    className="px-2 justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                                    Add Moderator
                                </button>
                            </AddModerator>
                        </div>
                    )}

                    {(Array.isArray(moderators.data) && moderators.data.length) && moderators.data.map((moderator) => (
                        <div className="flex flex-col gap-2">
                            <div className={cn("flex items-center justify-between p-2 px-4 rounded-lg bg-[#222]")}>
                                <div className="flex items-center gap-2">
                                    <UserAvatar user={moderator} />
                                    <div className="flex flex-col">
                                        <h1>{moderator.displayName}</h1>
                                        <p className="text-muted-foreground text-xs">u/{moderator.username}</p>
                                    </div>
                                </div>
                                <Trash onClick={() => deleteMod(moderator.id)} className="text-red-400 cursor-pointer w-5" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}