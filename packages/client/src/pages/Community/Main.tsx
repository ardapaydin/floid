import Header from "@/components/Community/Common/Header";
import Info from "@/components/Community/Common/Info";
import Posts from "@/components/Community/Post/Posts";
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

                        <Posts />
                    </div>
                    <Info community={community.data} />
                </div>
            </div>

        </Layout>
    )
}