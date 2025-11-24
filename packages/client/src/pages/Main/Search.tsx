import ObserverPost from "@/components/Community/Post/Post";
import Layout from "@/components/Layout/layout";
import Loading from "@/components/Loading/Loading";
import { clearRecentPosts, getRecentPosts } from "@/store/recentPosts";
import { useFeedSearch } from "@/utils/api/feed";
import { useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { Post } from "./Main";
import { Sandwich } from "lucide-react";

export default function Search() {
    const [q] = useSearchParams()
    const posts = useFeedSearch(q.get("q"))
    const [recent, setrecent] = useState(getRecentPosts());

    if (!q) return <Navigate to={"/"} />
    return (
        <Layout>
            <div className="flex flex-col">
                <div className="md:grid md:grid-cols-3 gap-4 min-h-screen">
                    <div className="w-full col-span-2 flex flex-col mb-8">
                        {posts.isLoading && <Loading />}
                        {!posts.isLoading && posts.data?.pages?.flatMap(page => page.posts).map((post => (
                            <ObserverPost section="feed" key={post.id} post={post} />
                        )))}
                        {!posts.isLoading && !(posts.data?.pages?.flatMap(p => p.posts).length) && (
                            <div className="mt-32 flex flex-col justify-center items-center">
                                <div className="flex items-center justify-center flex-col">
                                    <Sandwich className="w-32 h-32" />
                                    <h1 className="font-bold text-2xl text-white mb-2">No results found</h1>
                                    <p className="text-white/70">We couldn't find any posts matching "{q.get("q")}"</p>
                                    <p className="text-sm text-white/50 mt-2">Try different keywords or check your spelling</p>
                                </div>

                            </div>)}
                        {posts?.hasNextPage && (
                            <div
                                ref={(e) => {
                                    if (e) {
                                        const observer = new IntersectionObserver(
                                            ([entry]) => (entry.isIntersecting && !posts.isFetchingNextPage) && posts.fetchNextPage(),
                                            { threshold: 0.1 }
                                        );
                                        observer.observe(e);
                                        return () => observer.disconnect()
                                    }
                                }}
                                className="h-10 flex items-center justify-center mt-7"
                            >
                                {posts.isFetchingNextPage ? <Loading /> : null}
                            </div>
                        )}
                    </div>
                    <div className="w-full md:px-8 col-span-1 gap-4 flex flex-col">
                        {Boolean(recent.length) && (

                            <div className="bg-[#04090a] flex flex-col shadow p-2 py-4 px-3 rounded-lg gap-2">
                                <div className="justify-between flex items-center">
                                    <h1 className="text-muted-foreground uppercase text-xs" style={{ letterSpacing: "0.1rem" }}>Recent Posts</h1>
                                    <p
                                        onClick={() => { clearRecentPosts(); setrecent([]) }}
                                        className="text-orange-500 font-medium cursor-pointer">Clear
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {recent.map((post) => <Post post={post} />)}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </Layout>
    )
}