import Info from "@/components/Community/Common/Info";
import Comments from "@/components/Community/Post/Comments/Comments";
import ObserverPost from "@/components/Community/Post/Post";
import Layout from "@/components/Layout/layout";
import Loading from "@/components/Loading/Loading";
import { commentStore } from "@/store/commentStore";
import { addRecentPost } from "@/store/recentPosts";
import { userStore } from "@/store/userStore";
import type { Community } from "@/types/community";
import type { Post } from "@/types/post";
import { replyComment } from "@/utils/api/comment";
import { useCommunityByName } from "@/utils/api/community";
import { usePost } from "@/utils/api/post";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { NotFound } from "../Main/NotFound";

export default function Comment() {
    const { name, commentId } = useParams()
    const community = useCommunityByName(name!)
    const post = usePost(name!, commentId!)
    const nav = useNavigate();
    useEffect(() => {
        if (!post.data?.post) return;
        commentStore.setComment(post.data.post)
        if (post.data.replies) {
            const userIds = [post.data.post.createdBy, ...post.data.replies.map((x) => x.createdBy)];
            userStore.getUsersBulk(name!, [...new Set(userIds)]);
        }
        addRecentPost({ ...post.data.post, community: community.data as Community })
    }, [post.data, name, community.data])
    if (!community.data || !post.data) return <Layout><Loading /></Layout>
    if (!post.isLoading && !post.data?.post) return <NotFound />

    return (
        <Layout>
            <div className="flex flex-col">
                <div className="md:grid md:grid-cols-3 gap-4 min-h-screen">
                    <div className="w-full col-span-2 flex flex-col">
                        <div className="flex w-full items-start">
                            <div className="my-4">
                                <div className="bg-[#333] min-h-6 justify-center flex items-center cursor-pointer min-w-6 rounded-full" onClick={() => nav("/c/" + name)}>
                                    <ChevronLeft className="w-4" />
                                </div>
                            </div>
                            <ObserverPost post={post.data.post} section="post" />
                        </div>
                        {!post.data.post.deleted &&
                            <div className="w-full px-8">
                                <CommentInput />
                            </div>
                        }

                        <div className="flex flex-col mt-8 px-8">
                            <Comments comments={post.data.replies} commentId={commentId} />
                        </div>

                    </div>
                    <Info community={community.data} />
                </div>
            </div>
        </Layout>
    )
}

function CommentInput() {
    const [input, setInput] = useState("")
    const [isFocused, setIsFocused] = useState(false)
    const { name, commentId } = useParams();
    const [errors, setErrors] = useState<Record<string, string[]>>();
    const qc = useQueryClient();
    const submit = async () => {
        if (!name || !commentId) return;
        const r = await replyComment(name, commentId, input);
        if (r.status == 200) {
            setIsFocused(false);
            setInput("");
            commentStore.setComment(r.data.data)
            qc.setQueryData([name, "posts", commentId], (old: { replies: Post[] }) => ({
                ...old,
                replies: [
                    r.data.data,
                    ...old.replies,
                ]
            }))
        }
        else { setErrors(r.data?.errors); toast.error(r.data?.message) }
    }

    return (
        <div className={`flex flex-col border-2 rounded-${isFocused ? "lg" : "full"} ${isFocused ? 'border-orange-500' : 'border-[#313131]'} cursor-text w-full`} onClick={() => setIsFocused(!isFocused)}>
            {errors?.content && <p className="text-red-400">{errors.content[0]}</p>}
            {isFocused && (
                <>
                    <textarea
                        placeholder="Make a comment"
                        onChange={(e) => setInput(e.target.value)}
                        value={input}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        rows={3}
                        maxLength={10240}
                        className={`px-4 py-2 max-h-96 w-full text-white focus:outline-none transition`}
                    />

                    <div className="flex gap-2 items-center justify-end px-4 py-2">
                        <button
                            onClick={() => setIsFocused(false)}
                            className="mt-4 justify-center px-2 items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-0.5 rounded-lg border-orange-500 border-2 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); submit() }}
                            className="mt-4 justify-center px-2 items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-0.5 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition" >
                            Comment
                        </button>
                    </div>

                </>
            ) || (
                    <p className="px-4 py-2 text-muted-foreground">Make an comment</p>
                )}
        </div>

    )
}