import { observer } from "mobx-react-lite";
import { userStore } from "@/store/userStore";
import type { Post as PostType } from "@/types/post";
import { useNavigate, useParams } from "react-router-dom";
import { Award, ChevronDown, ChevronUp, EllipsisIcon, Forward, Lock, MessageCircle, Trash } from "lucide-react";
import dateToStr from "@/utils/date/dateToStr";
import { joinCommunity, leaveCommunity, useCommunities, useCommunityByName } from "@/utils/api/community";
import { cn } from "@/lib/utils";
import { CommunityIcon } from "../Common/Icon";
import { votePost } from "@/utils/api/post";
import { commentStore } from "@/store/commentStore";
import UserPart from "./Parts/User";
import type { Community } from "@/types/community";
import CommentDropdownMenu from "@/components/Dropdown/Comment";
import { Attachments } from "./Parts/Attachments";
import { useUser } from "@/utils/api/users";
import { useQueryClient } from "@tanstack/react-query";
import { MemberContextMenu } from "@/components/ContextMenu/Member";
import { CommunityHoverCard } from "@/components/HoverCards/Community";
import { AwardDialog } from "@/components/Dialogs/Post/Award";

function Post({ post, section = "posts", relatedTitle }: { post: (PostType | (PostType & { community: Community })), section?: ("posts" | "post" | "user" | "feed"), relatedTitle?: string }) {
    const { name } = useParams<{ name: string }>();
    const community = useCommunityByName(name!, section != "user");
    const comment = commentStore.getComment(post.id);
    const communities = useCommunities();
    const loggedUser = useUser();
    const nav = useNavigate();
    const qc = useQueryClient();
    if (!comment) {
        commentStore.setComment(post);
        return;
    }
    const user = userStore.getUser(name!, comment.createdBy);
    if (section !== "user" && !community.data) return

    const votepost = async (vote: ("up" | "down" | null)) => {
        commentStore.voteComment(post.id, vote)
        await votePost("community" in post ? post.community.name : name!, post.id, vote);
    }

    const join = async () => {
        if (!("community" in post)) return;
        const r = await joinCommunity(post.community.name);
        if (r.status == 200) qc.setQueryData(["communities"], (old: Community[]) => ([...old, "community" in post ? post.community : community.data]))
    }

    const leave = async () => {
        if (!("community" in post)) return;
        const r = await leaveCommunity(post.community.name);
        if (r.status == 200) qc.setQueryData(["communities"], (old: Community[]) => (old.filter(x => x.id != post.communityId)))
    }

    if ("community" in post && post.community.visibility == "private" && !communities.data?.find((x) => x.id == post.communityId)) return;

    return (
        <div
            onClick={() => {
                if (section == "posts") nav("/c/" + name + "/comments/" + post.id)
                if (("community" in post) && (section == "feed" || section == "user")) nav("/c/" + post.community.name + "/comments/" + (post.relatedTo ? post.relatedTo : post.id))
            }}
            className={cn("flex flex-col gap-2 w-full border-[#3b3b3b] px-3 py-4 transition rounded", (section !== "post") ? "border-t border-b hover:bg-[#333]/20 cursor-pointer" : "")}
        >
            <div className="flex justify-between">
                <div className="flex items-center gap-2 font-semibold text-muted-foreground text-sm">
                    {section == "posts" && (
                        <MemberContextMenu community={name!} member={user}>
                            <div>
                                <UserPart user={user} />
                            </div>
                        </MemberContextMenu>
                    ) || (section == "post" && (
                        <CommunityHoverCard community={community.data!}>
                            <div className="flex gap-2 cursor-pointer" onClick={() => nav("/c/" + community.data?.name)}>
                                <CommunityIcon community={community.data!} style={{ fontSize: "0.7rem" }} className="w-6 h-6" />
                                <div className="flex flex-col">
                                    <h1 className="text-white/90">c/{community.data!.name}</h1>
                                    <MemberContextMenu community={community.data!.name} member={user}>
                                        <span className="cursor-pointer hover:text-white transition-all" onClick={() => nav("/u/" + user?.username)}>{user?.displayName}</span>
                                    </MemberContextMenu>
                                </div>
                            </div>
                        </CommunityHoverCard>
                    ))}
                    {"community" in post && (
                        <CommunityHoverCard community={post.community}>
                            <div className="flex gap-2 cursor-pointer" onClick={() => nav("/c/" + post.community.name)}>
                                <CommunityIcon community={post.community} style={{ fontSize: "0.7rem" }} className="w-6 h-6" />
                                <div className="flex flex-col">
                                    <h1 className="text-white/90">c/{post.community.name}</h1>
                                    <span>{user?.displayName}</span>
                                </div>
                                {post.community.visibility == "private" && (
                                    <Lock className="w-4 h-4" />
                                )}
                            </div>
                        </CommunityHoverCard>

                    )}
                    <p className="text-xs">•</p>
                    {(relatedTitle && "community" in post) && (
                        <>
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    nav("/c/" + post.community.name + "/comments/" + post.relatedTo)
                                }}
                                className="text-xs hover:underline hover:text-blue-300 transition-all">
                                {relatedTitle}
                            </div>
                            <p className="text-xs">•</p>
                        </>
                    )}
                    <span className="text-xs">
                        {dateToStr(post.createdAt)}
                    </span>
                </div>
                <div className="flex gap-2 items-center">
                    {(!communities.data?.find((x) => x.id == post.communityId) && section == "feed") && (
                        <button
                            onClick={() => join()}
                            className="px-2 justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-0.5 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                            Join
                        </button>
                    )}
                    {("community" in post && (post.community.creator != loggedUser.data?.user?.id) && communities.data?.find((x) => x.id == post.communityId)) && (
                        <button
                            onClick={() => leave()}
                            className="px-2 justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-0.5 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                            Leave
                        </button>
                    )}
                    <CommentDropdownMenu comment={comment}>
                        <EllipsisIcon className="text-muted-foreground hover:text-white cursor-pointer" />
                    </CommentDropdownMenu>
                </div>
            </div>

            {comment.title && <h1 className="text-xl font-semibold">{post.title}</h1>}
            {comment.content && <p className="text-white/80 wrap-break-word whitespace-pre-wrap">{post.content}</p>}
            {Boolean(comment.attachments.length) && <Attachments post={comment} />}
            {
                comment.deleted && (
                    <div className="border p-4 border-[#444] rounded-lg gap-2 flex items-center px-6">
                        <Trash className="text-red-400" />
                        <div className="flex flex-col text-sm text-white/50">
                            <p>This post deleted by the author or community moderator</p>
                        </div>
                    </div>
                )
            }

            <div className={cn("flex gap-2 items-center", comment.deleted ? "opacity-50 select-none cursor-not-allowed pointer-events-none" : "")}>
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

                {comment.createdBy != loggedUser?.data?.user?.id &&
                    <AwardDialog post={comment}>
                        <div
                            onClick={(e) => { e.stopPropagation() }}
                            className="flex bg-[#333]/90 hover:bg-[#444] cursor-pointer transition px-3 gap-1 max-w-min py-1 items-center rounded-full">
                            <div className="hover:transition rounded-full">
                                <Award className="w-4" />
                            </div>
                        </div>
                    </AwardDialog>
                }

            </div>
        </div >
    );
}

const ObserverPost = observer(Post);
export default ObserverPost;
