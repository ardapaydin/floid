import type { Post } from "@/types/post";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useUser } from "@/utils/api/users";
import { Bookmark, Trash } from "lucide-react";
import { deleteComment } from "@/utils/api/comment";
import { useParams } from "react-router-dom";
import type { Community } from "@/types/community";
import { commentStore } from "@/store/commentStore";
import { useCommunityByName } from "@/utils/api/community";
import hasPermission from "@/utils/permissions/check";
import { savePost, unsavePost } from "@/utils/api/post";

export default function CommentDropdownMenu({ children, comment }: { children: React.ReactNode, comment: (Post | (Post & { community: Community })) }) {
    const user = useUser();
    const { name } = useParams();
    const community = useCommunityByName(name!, Boolean(name));
    const commentdata = commentStore.getComment(comment.id)
    const del = async () => {
        await deleteComment("community" in comment ? comment.community.name : name!, comment.id);
        commentStore.setCommentData(comment.id, { deleted: true, title: "", content: "", attachments: [], tags: [], createdBy: "" })
    }

    const triggerSave = async () => {
        if (!commentdata?.saved) {
            const r = await savePost(name!, comment.id);
            if (r.status == 200) commentStore.setCommentData(comment.id, { saved: true })
        } else {
            const r = await unsavePost(name!, comment.id)
            if (r.status == 200) commentStore.setCommentData(comment.id, { saved: false })
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
            <DropdownMenuContent className="border-0 w-64 bg-[#222121] mr-2">

                {!comment.relatedTo && (
                    <DropdownMenuItem
                        onClick={() => triggerSave()}
                        className="text-white/50 py-4 focus:bg-[#333]/50 transition focus:text-white/90 cursor-pointer">
                        <Bookmark />
                        {commentdata?.saved ? "Unsave" : "Save"}
                    </DropdownMenuItem>

                )}

                {(comment.createdBy == user.data?.user?.id || (community.data && hasPermission(community.data.permissions, "MANAGE_COMMUNITY"))) && (
                    <DropdownMenuItem
                        onClick={() => del()}
                        className="text-red-500 py-4 focus:bg-[#333]/50 transition focus:text-red-400 cursor-pointer">
                        <Trash />
                        Delete
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}