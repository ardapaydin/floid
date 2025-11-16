import Info from "@/components/Community/Common/Info";
import ObserverPost from "@/components/Community/Post/Post";
import Layout from "@/components/Layout/layout";
import { useCommunityByName } from "@/utils/api/community";
import { usePost } from "@/utils/api/post";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function Comment() {
    const { name, commentId } = useParams()
    const community = useCommunityByName(name!)
    const post = usePost(name!, commentId!)
    const nav = useNavigate();
    if (!community.data || !post.data) return;

    return (
        <Layout>
            <div className="flex flex-col">
                <div className="grid grid-cols-3 gap-4 min-h-screen">
                    <div className="w-full col-span-2 flex flex-col">
                        <div className="flex w-full items-start">
                            <div className="my-4">
                                <div className="bg-[#333] min-h-6 justify-center flex items-center cursor-pointer min-w-6 rounded-full" onClick={() => nav("/c/" + name)}>
                                    <ChevronLeft className="w-4" />
                                </div>
                            </div>
                            <ObserverPost post={post.data.post} section="post" />
                        </div>
                    </div>
                    <Info community={community.data} />
                </div>
            </div>
        </Layout>
    )
}