import { observer } from "mobx-react-lite";
import { userStore } from "@/store/userStore";
import type { Post as PostType } from "@/types/post";
import { useParams } from "react-router-dom";
import { UserAvatar } from "@/components/User/Avatar";
import { ChevronDown, ChevronUp, EllipsisIcon, Forward, MessageCircle } from "lucide-react";
import dateToStr from "@/utils/date/dateToStr";

function Post({ post }: { post: PostType }) {
    const { name } = useParams<{ name: string }>();
    const user = userStore.getUser(name!, post.createdBy);
    return (
        <div className="flex flex-col border-t border-b gap-2 border-[#3b3b3b] px-3 py-4 transition hover:bg-[#333]/20 cursor-pointer rounded">
            <div className="flex justify-between">
                <div className="flex items-center gap-2 font-semibold text-muted-foreground text-sm">
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
                    <div className="hover:transition hover:bg-[#222] hover:text-orange-400 rounded-full">
                        <ChevronUp className={post.vote == "up" ? "text-green-500" : ""} />
                    </div>
                    <p className="text-xs mr-1 ml-1 font-semibold">{post.votes}</p>
                    <div className="hover:transition hover:bg-[#222] hover:text-red-400 rounded-full">
                        <ChevronDown className={post.vote == "down" ? "text-red-500" : ""} />
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
        </div>
    );
}

const ObserverPost = observer(Post);
export default ObserverPost;
