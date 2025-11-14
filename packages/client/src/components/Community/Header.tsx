import type { Community } from "@/types/community";
import { useCommunities } from "@/utils/api/community";
import { CommunityIcon } from "./Icon";
import hasPermission from "@/utils/permissions/check";
import { Settings } from "lucide-react";
import CommunitySettings from "./Dialogs/Settings/Settings";

export default function Header({ community }: { community: Community }) {
    const communities = useCommunities();

    return (
        <div className="flex flex-col relative">
            <div className="w-full bg-[#222] h-32 rounded-lg" />
            <div className="absolute -bottom-12 left-7 right-12 flex items-end gap-2 justify-between">
                <div className="flex gap-2 items-end">
                    <div className="w-24 h-24 bg-[#1d1c1c] rounded-full border-[#1d1c1c] border-5">
                        <CommunityIcon community={community} className="text-2xl" />
                    </div>
                    <span className="mb-2 font-bold text-2xl flex"><p className="text-muted-foreground">c/</p>{community.name}</span>
                </div>
                <div className="flex gap-2">
                    <button className="mt-4 w-32 justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg border-orange-500 border-2 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
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
                        <button className="mt-4 w-16 justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                            Join
                        </button>
                    )}
                </div>
            </div>
        </div>

    )
}