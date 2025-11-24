import type { Community } from "@/types/community";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { CommunityIcon } from "../Community/Common/Icon";

export function CommunityHoverCard({ children, community }: { children: React.ReactNode, community: Community }) {
    return (
        <HoverCard>
            <HoverCardTrigger asChild>{children}</HoverCardTrigger>
            <HoverCardContent className="bg-[#333] border-0 text-white  p-0">
                <div className="relative">
                    <div className="w-full bg-[#222] h-16 rounded-lg">
                        {community.banner && <img src={import.meta.env.VITE_CDN_URL + "/banners/" + community.banner} className="object-cover w-full h-full rounded-t-lg" draggable={false} />}
                    </div>
                </div>
                <div className="mt-2 px-2 pb-4">
                    <div className="flex gap-2 items-end">
                        <div className="w-12 h-12 bg-[#1d1c1c] rounded-full border-[#1d1c1c] border-4 md:border-5">
                            <CommunityIcon community={community} className="text-lg w-full h-full" />
                        </div>
                        <span className="mb-1 sm:mb-2 font-bold text-sm  flex"><p className="text-muted-foreground">c/</p>{community.name}</span>
                    </div>
                    <p className="text-xs wrap-break-word text-white/50">{community.description}</p>

                </div>

            </HoverCardContent>
        </HoverCard>
    )
}