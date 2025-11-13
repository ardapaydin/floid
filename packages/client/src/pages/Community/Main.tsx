import Layout from "@/components/Layout/layout";
import { useCommunityByName } from "@/utils/api/community";
import { useParams } from "react-router-dom";

export default function Community() {
    const { name } = useParams()
    const community = useCommunityByName(name!)
    return (
        <Layout>
            <div>{community.data?.name}</div>
        </Layout>
    )
}