import ObserverPost from "@/components/Community/Post/Post";
import { SortPosts } from "@/components/Dropdown/Sort";
import Loading from "@/components/Loading/Loading";
import { useFeedPosts } from "@/utils/api/feed";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function MainPosts() {
    const [sort, setSort] = useState<("best" | "new")>("best")
    const posts = useFeedPosts(sort);

    return (
        <>
            <div className="flex">
                <SortPosts sort={sort} setSort={setSort}>
                    <div className="flex items-center gap-2 text-sm hover:bg-[#333] p-2 rounded-lg cursor-pointer">
                        {sort == "best" ? "Best" : "New"}
                        <ChevronDown className="w-4" />
                    </div>
                </SortPosts>

            </div>

            {posts.isLoading && <Loading />}
            {!posts.isLoading && posts.data?.pages?.flatMap(page => page.posts).map((post => (
                <ObserverPost section="user" key={post.id} post={post} />
            )))}
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

        </>
    )
}