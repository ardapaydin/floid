import Layout from "../../components/Layout/layout";
import Loading from "@/components/Loading/Loading";
import { useExploreCommunities } from "@/utils/api/explore";
import { CommunityIcon } from "@/components/Community/Common/Icon";
import { useNavigate } from "react-router-dom";
import { MainPosts } from "./Posts";
import { clearRecentPosts, getRecentPosts } from "@/store/recentPosts";
import type { Post } from "@/types/post";
import type { Community } from "@/types/community";
import dateToStr from "@/utils/date/dateToStr";
import { useState } from "react";

export default function Main() {
    const exploreCommunities = useExploreCommunities();
    const nav = useNavigate()
    const [posts, setPosts] = useState(getRecentPosts());
    return (
        <Layout>
            <div className="flex flex-col">
                <div className="md:grid md:grid-cols-3 gap-4 min-h-screen">
                    <div className="w-full col-span-2 flex flex-col mb-8">
                        <MainPosts />
                    </div>
                    <div className="w-full md:px-8 col-span-1 gap-4 flex flex-col">
                        <div className="bg-[#04090a] flex flex-col shadow p-2 py-4 px-3 rounded-lg gap-2">
                            <h1 className="text-muted-foreground uppercase text-xs" style={{ letterSpacing: "0.1rem" }}>Explore Communities</h1>

                            {exploreCommunities.isLoading && <Loading />}
                            {!exploreCommunities.isLoading && exploreCommunities.data?.map((community) => (
                                <div className="flex gap-2 items-center p-2 hover:bg-[#333]/50 cursor-pointer rounded-lg transition-all" onClick={() => nav("/c/" + community.name)}>
                                    <CommunityIcon community={community} className="w-8 h-8" />
                                    <div className="flex flex-col">
                                        <h1 className="text-sm text-white/60">c/{community.name}</h1>
                                        <p className="text-xs text-muted-foreground">{community.members} Members</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {Boolean(posts.length) && (
                            <div className="bg-[#04090a] flex flex-col shadow p-2 py-4 px-3 rounded-lg gap-2">
                                <div className="justify-between flex items-center">
                                    <h1 className="text-muted-foreground uppercase text-xs" style={{ letterSpacing: "0.1rem" }}>Recent Posts</h1>
                                    <p
                                        onClick={() => { clearRecentPosts(); setPosts([]) }}
                                        className="text-orange-500 font-medium cursor-pointer">Clear
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {posts.map((post) => <Post post={post} />)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </Layout >
    )
}

export function Post({ post }: { post: (Post & { community: Community }) }) {
    const nav = useNavigate();
    if (!post.community) return
    return (
        <div className="flex justify-between p-2 hover:bg-[#333]/50 rounded-lg group transition-all cursor-pointer" onClick={() => nav("/c/" + post.community.name + "/comments/" + post.id)}>
            <div className="flex flex-col gap-2 ">
                <div className="flex gap-2 items-center">
                    <CommunityIcon community={post.community} className="w-8 h-8" />
                    <div className="flex gap-1 text-white/40 items-center">
                        <h1 className="text-sm font-medium">c/{post.community.name}</h1>
                        <p className="text-xs">•</p>
                        <span className="text-xs">
                            {dateToStr(post.createdAt)}
                        </span>
                    </div>
                </div>

                <p className="text-xs text-white/50 font-medium group-hover:underline">{post.title}</p>

                <div className="flex gap-2 text-xs text-white/40">
                    <span>{post.comments} Comments</span>
                    <p className="text-xs">•</p>
                    <span>{post.votes} Votes</span>
                </div>
            </div>

            {Boolean(post.attachments.length) && (
                <div>
                    <img src={import.meta.env.VITE_CDN_URL + "/" + post.attachments[0].url} className="max-w-16 rounded-lg max-h-16" draggable={false} />
                </div>
            )}
        </div>
    )
}