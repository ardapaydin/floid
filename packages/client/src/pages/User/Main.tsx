import Layout from "@/components/Layout/layout";
import { useUserProfile } from "@/utils/api/users";
import { useParams } from "react-router-dom";

export default function User() {
    const { name } = useParams();
    const profile = useUserProfile(name!);

    return (
        <Layout>
            <div className="mt-24 grid grid-cols-3 gap-4 min-h-screen">
                <div className="w-full col-span-2 flex flex-col">
                    {profile.data?.posts?.length}
                </div>
            </div>
        </Layout>
    )
}