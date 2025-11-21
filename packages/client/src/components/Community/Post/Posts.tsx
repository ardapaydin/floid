import { userStore } from "@/store/userStore";
import { usePosts } from "@/utils/api/post";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import ObservedPost from "./Post";
import { commentStore } from "@/store/commentStore";
import Loading from "@/components/Loading/Loading";
import { SortPosts } from "@/components/Dropdown/Sort";
import { ChevronDown } from "lucide-react";
export default function Posts() {
    const { name } = useParams();
    const nav = useNavigate()
    const [sort, setSort] = useState<("best" | "new")>("best");
    const posts = usePosts(name!, sort);
    useEffect(() => {
        if (!posts.data?.pages?.length || !name) return;
        const list = posts.data.pages.flatMap(page => page.posts);
        userStore.getUsersBulk(name, list.map((x) => x.createdBy))
        commentStore.setComments(list)
    }, [posts.data, name])

    if (posts.data?.pages?.length && posts.data.pages.every(page => !page.posts.length)) return <div className="mt-32 flex flex-col justify-center items-center">
        <h1 className="font-bold text-2xl">{name} community doesn't have any posts yet</h1>

        <button
            onClick={() => nav("submit")}
            className="mt-4 w-32 justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
            Create Post
        </button>
    </div>

    return (
        <div className="flex flex-col">

            <div className="flex">
                <SortPosts sort={sort} setSort={setSort}>
                    <div className="flex items-center gap-2 text-sm hover:bg-[#333] p-2 rounded-lg cursor-pointer">
                        {sort == "best" ? "Best" : "New"}
                        <ChevronDown className="w-4" />
                    </div>
                </SortPosts>

            </div>
            <hr className="border-black mb-4 mt-4" />
            {posts.isLoading && <Loading />}
            {posts.data?.pages?.flatMap(page => page.posts).map((post => (
                <ObservedPost key={post.id} post={post} />
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
        </div>
    )
}