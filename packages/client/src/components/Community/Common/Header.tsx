import type { Community } from "@/types/community";
import { joinCommunity, leaveCommunity, useCommunities } from "@/utils/api/community";
import { CommunityIcon } from "./Icon";
import hasPermission from "@/utils/permissions/check";
import { Settings } from "lucide-react";
import CommunitySettings from "../Dialogs/Settings/Settings";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/utils/api/users";

export default function Header({ community }: { community: Community }) {
    const communities = useCommunities();
    const user = useUser();
    const nav = useNavigate();
    const qc = useQueryClient();
    const join = async () => {
        const r = await joinCommunity(community.name);
        if (r.status == 200) qc.setQueryData(["communities"], (old: Community[]) => ([...old, community]))
    }

    const leave = async () => {
        const r = await leaveCommunity(community.name);
        if (r.status == 200) qc.setQueryData(["communities"], (old: Community[]) => (old.filter(x => x.id != community.id)))
    }

    return (
        <div className="flex flex-col relative">
            <div className="w-full bg-[#222] h-32 rounded-lg" >
                {community.banner && <img src={import.meta.env.VITE_CDN_URL + "/banners/" + community.banner} className="object-cover w-full h-full rounded-lg" draggable={false} />}
            </div>
            <div className="absolute -bottom-12 left-4 right-4 md:left-7 md:right-12 flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-2 md:justify-between">
                <div className="flex gap-2 items-end">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-[#1d1c1c] rounded-full border-[#1d1c1c] border-4 md:border-5">
                        <CommunityIcon community={community} className="text-lg sm:text-xl md:text-2xl" />
                    </div>
                    <span className="mb-1 sm:mb-2 font-bold text-lg sm:text-xl md:text-2xl flex"><p className="text-muted-foreground">c/</p>{community.name}</span>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => nav("submit")}
                        className="mt-4 w-32 justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg border-orange-500 border-2 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                        Create Post
                    </button>

                    {hasPermission(community.permissions, "MANAGE_COMMUNITY") && (
                        <CommunitySettings>
                            <button className="mt-4 px-2 justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg border-orange-500 border-2 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                                <Settings />
                            </button>
                        </CommunitySettings>
                    )}

                    {!communities.data?.find((x) => x.id == community.id) && (
                        <button
                            onClick={() => join()}
                            className="mt-4 w-16 justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                            Join
                        </button>
                    ) || (community.creator != user.data?.user?.id) && (
                        <button
                            onClick={() => leave()}
                            className="mt-4 w-16 justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition"
                        >
                            Leave
                        </button>
                    )}
                </div>
            </div>
        </div>

    )
}