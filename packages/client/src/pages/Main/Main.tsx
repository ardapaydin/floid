import { useFeedPosts } from "@/utils/api/feed";
import Layout from "../../components/Layout/layout";
import Loading from "@/components/Loading/Loading";
import ObserverPost from "@/components/Community/Post/Post";

export default function Main() {
    const posts = useFeedPosts("best");
    return (
        <Layout>
            <div className="flex flex-col">
                <div className="md:grid md:grid-cols-3 gap-4 min-h-screen">
                    <div className="w-full col-span-2 flex flex-col mb-8">
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

                    </div>
                    <div className="w-full md:px-8 col-span-1">
                        <div className="bg-[#04090a] flex flex-col shadow p-4 rounded-lg gap-4">
                        </div>
                    </div>
                </div>
            </div>

        </Layout>
    )
}