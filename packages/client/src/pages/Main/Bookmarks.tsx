import ObserverPost from "@/components/Community/Post/Post";
import Layout from "@/components/Layout/layout";
import Loading from "@/components/Loading/Loading";
import { useBookmarks } from "@/utils/api/users";
import { BookmarkX, Search } from "lucide-react";
import { useState } from "react";

export function Bookmarks() {
    const [query, setQuery] = useState("");
    const saves = useBookmarks(query);
    return (
        <Layout>
            <div className="flex flex-col">
                <div className="md:grid md:grid-cols-3 gap-4 min-h-screen">
                    <div className="w-full col-span-2 flex flex-col mb-8">

                        <div className="flex focus-within:ring-2 rounded-full items-center focus-within:ring-orange-400/50 transition">
                            <div className="py-2 px-4 bg-[#313131] rounded-full rounded-r-none border-b-3 border-[#242323]">
                                <Search />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoComplete="off"
                                placeholder="Search"
                                className="px-2 py-2 pr-32 rounded-full rounded-l-none w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                            />
                        </div>

                        {saves.isLoading && <Loading />}
                        {!saves.isLoading && saves.data?.pages?.flatMap(p => p.posts).map((post) => <ObserverPost section="feed" key={post.id} post={post} />)}
                        {saves?.hasNextPage && (
                            <div ref={(e) => {
                                if (!e) return;
                                const observer = new IntersectionObserver(
                                    ([entry]) => (entry.isIntersecting && !saves.isFetchingNextPage) && saves.fetchNextPage(),
                                    { threshold: 0.1 }
                                );
                                observer.observe(e);
                                return () => observer.disconnect()
                            }}
                                className="h-10 flex items-center justify-center mt-7">
                                {saves.isFetchingNextPage && <Loading />}
                            </div>
                        )}

                        {!saves.isLoading && !(saves.data?.pages?.flatMap(p => p.posts).length) && (
                            <div className="mt-32 flex flex-col justify-center items-center">
                                <div className="flex items-center justify-center flex-col">
                                    <BookmarkX className="w-32 h-32" />
                                    <h1 className="font-bold text-2xl text-white mb-2">No bookmarks found</h1>
                                    <p className="text-sm text-white/50 mt-2">
                                        {query ? `We couldn't find any posts matching "${query}"` : "You haven't saved any posts yet"}
                                    </p>
                                </div>

                            </div>)}

                    </div>
                </div>
            </div>
        </Layout>
    )
}