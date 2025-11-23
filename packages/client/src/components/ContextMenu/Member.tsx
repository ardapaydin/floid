import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../ui/context-menu";
import type { User } from "@/types/user";
import { useCommunityByName } from "@/utils/api/community";
import hasPermission from "@/utils/permissions/check";
import { Ban } from "lucide-react";
import { BanMember } from "../Dialogs/Community/Ban/Member";

export function MemberContextMenu({ children, community, member }: { children: React.ReactNode, community: string, member: User }) {

    const communitydata = useCommunityByName(community);
    const canBan = hasPermission(communitydata.data?.permissions || "0", "MANAGE_MEMBERS")

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent onFocusOutside={(e) => {
                e.preventDefault();
            }}
                onContextMenu={(e) => {
                    e.stopPropagation();
                }}>
                {canBan && (
                    <BanMember member={member} community={communitydata.data!}>
                        <ContextMenuItem
                            className="text-red-500 font-bold focus:bg-[#333]/50 transition focus:text-red-400 cursor-pointer"
                            onSelect={(e) => {
                                e.preventDefault();
                            }}>
                            <Ban />
                            Ban u/{member.username}
                        </ContextMenuItem>
                    </BanMember>
                )}
            </ContextMenuContent>
        </ContextMenu>
    )
}