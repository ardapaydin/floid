import Info from "@/components/Community/Common/Info";
import ObserverPost from "@/components/Community/Post/Post";
import Layout from "@/components/Layout/layout";
import { commentStore } from "@/store/commentStore";
import { useCommunityByName } from "@/utils/api/community";
import { usePost } from "@/utils/api/post";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Comment() {
    const { name, commentId } = useParams()
    const community = useCommunityByName(name!)
    const post = usePost(name!, commentId!)
    const nav = useNavigate();
    useEffect(() => {
        if (!post.data) return;
        commentStore.setComment(post.data.post)
    }, [post.data, name])

    if (!community.data || !post.data) return;

    return (
        <Layout>
            <div className="flex flex-col">
                <div className="grid grid-cols-3 gap-4 min-h-screen">
                    <div className="w-full col-span-2 flex flex-col">
                        <div className="flex w-full items-start">
                            <div className="my-4">
                                <div className="bg-[#333] min-h-6 justify-center flex items-center cursor-pointer min-w-6 rounded-full" onClick={() => nav("/c/" + name)}>
                                    <ChevronLeft className="w-4" />
                                </div>
                            </div>
                            <ObserverPost post={post.data.post} section="post" />
                        </div>
                        <div className="w-full px-8">
                            <CommentInput />
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
    return (
        <div className={`flex flex-col border-2 rounded-${isFocused ? "lg" : "full"} ${isFocused ? 'border-orange-500' : 'border-[#313131]'} cursor-text w-full`} onClick={() => setIsFocused(!isFocused)}>
            {isFocused && (
                <>
                    <input
                        placeholder="Make a comment"
                        onChange={(e) => setInput(e.target.value)}
                        value={input}
                        className={`px-4 py-2 w-full text-white focus:outline-none transition`}
                    />

                    <div className="flex gap-2 items-center justify-end px-4 py-2">
                        <button
                            onClick={() => setIsFocused(false)}
                            className="mt-4 justify-center px-2 items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-0.5 rounded-lg border-orange-500 border-2 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition"
                        >
                            Cancel
                        </button>
                        <button className="mt-4 justify-center px-2 items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-0.5 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition" >
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