import Layout from "../../components/Layout/layout";
import Loading from "@/components/Loading/Loading";
import { useExploreCommunities } from "@/utils/api/explore";
import { CommunityIcon } from "@/components/Community/Common/Icon";
import { useNavigate } from "react-router-dom";
import { MainPosts } from "./Posts";

export default function Main() {
    const exploreCommunities = useExploreCommunities();
    const nav = useNavigate()
    return (
        <Layout>
            <div className="flex flex-col">
                <div className="md:grid md:grid-cols-3 gap-4 min-h-screen">
                    <div className="w-full col-span-2 flex flex-col mb-8">
                        <MainPosts />
                    </div>
                    <div className="w-full md:px-8 col-span-1">
                        <div className="bg-[#04090a] flex flex-col shadow p-2 py-4 px-3 rounded-lg gap-2">
                            <h1 className="text-muted-foreground uppercase text-xs" style={{ letterSpacing: "0.1rem" }}>Explore Communities</h1>

                            {exploreCommunities.isLoading && <Loading />}
                            {!exploreCommunities.isLoading && exploreCommunities.data?.map((community) => (
                                <div className="flex gap-2 items-center p-2 hover:bg-[#333]/50 cursor-pointer rounded-lg transition-all" onClick={() => nav("/c/" + community.name)}>
                                    <CommunityIcon community={community} className="w-8" />
                                    <div className="flex flex-col">
                                        <h1 className="text-sm text-white/60">c/{community.name}</h1>
                                        <p className="text-xs text-muted-foreground">{community.members} Members</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </Layout>
    )
}