import Header from "@/components/Community/Header";
import Info from "@/components/Community/Info";
import Layout from "@/components/Layout/layout";
import { useCommunities, useCommunityByName } from "@/utils/api/community";
import { useParams } from "react-router-dom";

export default function Community() {
    const { name } = useParams()
    const community = useCommunityByName(name!)
    const communities = useCommunities();

    if (community.isLoading || communities.isLoading || !community.data) return <Layout><div></div></Layout>
    return (
        <Layout>
            <div className="flex flex-col">
                <Header community={community.data} />
                <div className="mt-24 grid grid-cols-3 gap-4 min-h-screen">
                    <div className="w-full col-span-2 flex flex-col">
                        <hr className="border-black" />

                        <div className="mt-32 flex flex-col justify-center items-center">
                            <h1 className="font-bold text-2xl">{name} community doesn't have any posts yet</h1>

                            <button className="mt-4 w-32 justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                                Create Post
                            </button>

                        </div>
                    </div>
                    <Info community={community.data} />
                </div>
            </div>

        </Layout>
    )
}