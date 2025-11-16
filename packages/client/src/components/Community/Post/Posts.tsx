import { userStore } from "@/store/userStore";
import { usePosts } from "@/utils/api/post";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"
import ObservedPost from "./Post";
export default function Posts() {
    const { name } = useParams();
    const nav = useNavigate()
    const posts = usePosts(name!, "best");
    useEffect(() => {
        if (!Array.isArray(posts.data) || !name) return;
        userStore.getUsersBulk(name, posts.data?.map((x) => x.createdBy))
    }, [posts.data, name])


    if (posts.isLoading || !name) return;
    if (Array.isArray(posts.data) && !posts.data.length) return <div className="mt-32 flex flex-col justify-center items-center">
        <h1 className="font-bold text-2xl">{name} community doesn't have any posts yet</h1>

        <button
            onClick={() => nav("submit")}
            className="mt-4 w-32 justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
            Create Post
        </button>

    </div>;

    return (
        <div className="flex flex-col">
            {posts.data?.map((post => (
                <ObservedPost post={post} />
            )))}
        </div>
    )
}