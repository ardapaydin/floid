import { Home, Lock, Plus } from "lucide-react";
import CreateCommunity from "../Dialogs/Community/Create";
import { useCommunities } from "@/utils/api/community";
import { useNavigate } from "react-router-dom";
import { CommunityIcon } from "../Community/Common/Icon";

export function Sidebar() {
    const communities = useCommunities();
    const nav = useNavigate();
    return (
        <div className="h-full border-[#3b3b3b] min-w-1/7 hidden md:flex border-r md:p-4">
            <div className="flex flex-col text-white/90 w-full">
                <div
                    onClick={() => nav("/")}
                    className="hover:bg-[#333]/20 transition cursor-pointer w-full flex py-3 xl:px-4 rounded-lg gap-2 text-sm items-center">
                    <Home className="w-8" />
                    Home
                </div>

                <hr className="mt-4 mb-4 border-gray-800/50" />

                <div className="flex flex-col xl:mx-4">
                    <h1 className="uppercase text-xs text-gray-300/50" style={{ letterSpacing: "0.03rem" }}>Communities</h1>
                </div>


                <CreateCommunity>
                    <div className="hover:bg-[#333]/20 mt-4 transition cursor-pointer flex py-3 lg:px-4 rounded-lg gap-2 text-sm items-center">
                        <Plus className="w-6" />
                        Create Community
                    </div>
                </CreateCommunity>

                {Array.isArray(communities.data) && (communities.data.map(community => (
                    <div
                        onClick={() => nav("/c/" + community.name)}
                        className="hover:bg-[#333]/20 transition cursor-pointer flex py-3 lg:px-4 rounded-lg gap-2 justify-between text-sm items-center">
                        <div className="flex items-center gap-2">
                            <CommunityIcon community={community} className="w-6 h-6" style={{ fontSize: "9px" }} />
                            c/{community.name}
                        </div>
                        {community.visibility == "private" && <Lock className="text-muted-foreground/50" />}
                    </div>
                )))}
            </div>
        </div>
    )
}