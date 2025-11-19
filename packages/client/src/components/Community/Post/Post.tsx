import { observer } from "mobx-react-lite";
import { userStore } from "@/store/userStore";
import type { Post as PostType } from "@/types/post";
import { useNavigate, useParams } from "react-router-dom";
import { UserAvatar } from "@/components/User/Avatar";
import { ChevronDown, ChevronUp, EllipsisIcon, Forward, MessageCircle } from "lucide-react";
import dateToStr from "@/utils/date/dateToStr";
import { useCommunityByName } from "@/utils/api/community";
import { cn } from "@/lib/utils";
import { CommunityIcon } from "../Common/Icon";
import { votePost } from "@/utils/api/post";
import { commentStore } from "@/store/commentStore";

function Post({ post, section = "posts" }: { post: PostType, section?: ("posts" | "post") }) {
    const { name } = useParams<{ name: string }>();
    const community = useCommunityByName(name!);
    const user = userStore.getUser(name!, post.createdBy);
    const comment = commentStore.getComment(post.id);
    const nav = useNavigate();
    if (!comment) return
    if (!community.data) return

    const votepost = async (vote: ("up" | "down" | null)) => {
        const r = await votePost(name!, post.id, vote);
        if (r.status === 200) commentStore.voteComment(post.id, vote)
    }

    return (
        <div
            onClick={() => section == "posts" ? nav("/c/" + name + "/comments/" + post.id) : null}
            className={cn("flex flex-col gap-2 w-full border-[#3b3b3b] px-3 py-4 transition rounded", section == "posts" ? "border-t border-b hover:bg-[#333]/20 cursor-pointer" : "")}
        >
            <div className="flex justify-between">
                <div className="flex items-start gap-2 font-semibold text-muted-foreground text-sm">
                    {section == "posts" && (
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
                    ) || (section == "post" && (
                        <div className="flex gap-2">
                            <CommunityIcon community={community.data} style={{ fontSize: "0.7rem" }} className="w-6 h-6" />
                            <div className="flex flex-col">
                                <h1 className="text-white/90">c/{community.data.name}</h1>
                                <span>{user?.displayName}</span>
                            </div>
                        </div>
                    ))}
                    <p className="text-xs">•</p>
                    <span className="text-xs">
                        {dateToStr(post.createdAt)}
                    </span>
                </div>

                <div>
                    <EllipsisIcon className="text-muted-foreground hover:text-white cursor-pointer" />
                </div>
            </div>

            {post.title && <h1 className="text-xl font-semibold">{post.title}</h1>}
            {post.content && <p className="text-white/80 wrap-break-word whitespace-pre-wrap">{post.content}</p>}

            <div className="flex gap-2 items-center">
                <div className="flex bg-[#333]/90 px-2 max-w-min py-1 items-center rounded-full">
                    <div onClick={(e) => { e.stopPropagation(); if (comment.vote == "up") votepost(null); else votepost("up") }} className="cursor-pointer hover:transition hover:bg-[#222] hover:text-orange-400 rounded-full">
                        <ChevronUp className={comment.vote == "up" ? "text-green-500" : ""} />
                    </div>
                    <p className="text-xs mr-1 ml-1 font-semibold">{comment.votes}</p>
                    <div onClick={(e) => { e.stopPropagation(); if (comment.vote == "down") votepost(null); else votepost("down") }} className="cursor-pointer hover:transition hover:bg-[#222] hover:text-red-400 rounded-full">
                        <ChevronDown className={comment.vote == "down" ? "text-red-500" : ""} />
                    </div>
                </div>

                <div className="flex bg-[#333]/90 hover:bg-[#444] transition px-3 gap-2 max-w-min py-1 items-center rounded-full">
                    <div className="hover:transition rounded-full">
                        <MessageCircle className="w-4" />
                    </div>
                    <p className="text-xs">{post.comments}</p>
                </div>

                <div className="flex bg-[#333]/90 hover:bg-[#444] transition px-3 gap-1 max-w-min py-1 items-center rounded-full">
                    <div className="hover:transition rounded-full">
                        <Forward className="w-4" />
                    </div>
                    <p className="text-xs font-semibold">Share</p>
                </div>

            </div>
        </div >
    );
}

const ObserverPost = observer(Post);
export default ObserverPost;
