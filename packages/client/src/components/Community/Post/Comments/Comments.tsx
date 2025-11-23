import { cn } from "@/lib/utils";
import { userStore } from "@/store/userStore";
import type { Post } from "@/types/post";
import dateToStr from "@/utils/date/dateToStr";
import { ChevronDown, ChevronUp, EllipsisIcon, Forward, Plus, Trash } from "lucide-react";
import UserPart from "../Parts/User";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { votePost } from "@/utils/api/post";
import { commentStore } from "@/store/commentStore";
import { useState } from "react";
import { replyComment } from "@/utils/api/comment";
import { useQueryClient } from "@tanstack/react-query";
import CommentDropdownMenu from "@/components/Dropdown/Comment";
import { UserAvatar } from "@/components/User/Avatar";
import type { User } from "@/types/user";
import toast from "react-hot-toast";

export default function Comments({ comments, commentId, depth = 0 }: { comments: Post[], commentId?: string, depth?: number }) {
    const filter = (comments).filter(x => x.replyTo == commentId).sort((a, b) => b.votes - a.votes);
    return filter.map((comment) => <ObserverComment key={comment.id} comment={comment} comments={comments} depth={depth} />)
}

function Comment({ comment, comments, depth = 0 }: { comment: Post, comments: Post[], depth?: number }) {
    const { name } = useParams()
    const user = userStore.getUser(name!, comment.createdBy)
    const commentdata = commentStore.getComment(comment.id)
    const related = commentStore.getComment(comment.relatedTo || "");
    const replies = (comments).filter(x => x.replyTo == comment.id).sort((a, b) => b.votes - a.votes)
    const [isReplying, setIsReplying] = useState(false);
    const [viewMore, setViewMore] = useState(false);
    const votepost = async (vote: ("up" | "down" | null)) => {
        commentStore.voteComment(comment.id, vote)
        await votePost(name!, comment.id, vote);
    }
    if (!commentdata) {
        commentStore.setComment(comment);
        return;
    }
    return (
        <div className={cn("flex", depth > 0 && "border-l-2 border-muted-foreground/20 ml-2")}>
            <div className="flex-1">
                <div className={cn("flex flex-col gap-2 w-full px-3 py-2", depth === 0 && "border-b border-muted-foreground/10")}>
                    <div className="flex justify-between">
                        <div className="flex items-start gap-2 font-semibold text-muted-foreground text-sm">
                            {commentdata.deleted && (
                                <>
                                    <UserAvatar className="w-6 h-6" user={{ displayName: "?" } as User} />
                                    <h1>[comment deleted]</h1>
                                </>
                            ) ||
                                <UserPart user={user} />}
                            <p className="text-xs">•</p>
                            <span className="text-xs">
                                {dateToStr(comment.createdAt)}
                            </span>
                        </div>

                        <CommentDropdownMenu comment={commentdata}>
                            <EllipsisIcon className="text-muted-foreground hover:text-white cursor-pointer" />
                        </CommentDropdownMenu>
                    </div>

                    {commentdata.content && <p className="text-white/80 wrap-break-word whitespace-pre-wrap">{commentdata.content}</p>}
                    {commentdata.deleted && (
                        <div className="border p-2 border-[#444] rounded-lg gap-2 flex items-center px-4">
                            <Trash className="text-red-400 w-4" />
                            <div className="flex flex-col text-sm text-white/50">
                                <p>This comment deleted by the author or community moderator</p>
                            </div>
                        </div>
                    )}

                    <div className={cn("flex gap-2 items-center", commentdata.deleted ? "opacity-50 select-none cursor-not-allowed pointer-events-none" : "")}>
                        <div className="flex px-2 max-w-min py-0.5 items-center rounded-full">
                            <div onClick={(e) => { e.stopPropagation(); if (commentdata.vote == "up") votepost(null); else votepost("up") }} className="cursor-pointer hover:transition hover:bg-[#222] hover:text-orange-400 rounded-full">
                                <ChevronUp className={commentdata.vote == "up" ? "text-green-500" : ""} />
                            </div>
                            <p className="text-xs mr-1 ml-1 font-semibold">{commentdata.votes == 0 ? "Vote" : commentdata.votes}</p>
                            <div onClick={(e) => { e.stopPropagation(); if (commentdata.vote == "down") votepost(null); else votepost("down") }} className="cursor-pointer hover:transition hover:bg-[#222] hover:text-red-400 rounded-full">
                                <ChevronDown className={commentdata.vote == "down" ? "text-red-500" : ""} />
                            </div>
                        </div>
                        {!related?.deleted && (
                            <div className="flex transition px-3 gap-1 max-w-min py-0.5 items-center rounded-full cursor-pointer" onClick={() => setIsReplying(!isReplying)}>
                                <div className="hover:transition rounded-full">
                                    <Forward className="w-4" />
                                </div>
                                <p className="text-xs font-semibold">Reply</p>
                            </div>
                        )}
                    </div>

                    {isReplying && (
                        <ReplyInput setIsReplying={setIsReplying} commentId={comment.id} />
                    )}


                </div>

                {replies.length > 0 && (depth <= 8 || viewMore) && (
                    <Comments comments={comments} commentId={comment.id} depth={depth + 1} />
                )}

                {(!viewMore && depth >= 8 && replies.length > 0) && (
                    <div className="px-2">
                        <div className="w-full flex justify-center items-center gap-2 py-2 mt-2 rounded-lg border opacity-20 hover:opacity-50 cursor-pointer transition-all" onClick={() => setViewMore(true)}>
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">View more replies</span>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}

const ObserverComment = observer(Comment);

function ReplyInput({ setIsReplying, commentId }: { setIsReplying: React.Dispatch<React.SetStateAction<boolean>>, commentId: string }) {
    const [input, setInput] = useState("");
    const { name, commentId: cid } = useParams();
    const qc = useQueryClient();
    const submit = async () => {
        if (!name || !commentId) return;
        const r = await replyComment(name, commentId, input);
        if (r.status == 200) {
            setIsReplying(false);
            setInput("");
            commentStore.setComment(r.data.data)
            qc.setQueryData([name, "posts", cid], (old: { replies: Post[] }) => ({
                ...old,
                replies: [
                    r.data.data
                    ,
                    ...old.replies,
                ]
            }))
        } else toast.error(r.data?.message)
    }
    return (
        <div className={`flex flex-col border-2 rounded-lg border-[#313131] cursor-text w-full`}>
            <input
                placeholder="Make a comment"
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                maxLength={10240}
                className={`px-4 py-2 max-h-16 w-full text-white focus:outline-none transition`}
            />

            <div className="flex gap-2 items-center justify-end px-4 pb-2">
                <button
                    onClick={() => setIsReplying(false)}
                    className="mt-4 justify-center px-2 items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-0.5 rounded-lg border-orange-500 border-2 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition"
                >
                    Cancel
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); submit() }}
                    className="mt-4 justify-center px-2 items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-0.5 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition" >
                    Reply
                </button>
            </div>
        </div>

    )
}