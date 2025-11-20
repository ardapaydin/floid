import ObserverPost from "@/components/Community/Post/Post";
import { useUserProfile } from "@/utils/api/users"
import { useParams } from "react-router-dom";

export default function Comments() {
    const { name } = useParams();
    const profile = useUserProfile(name!);
    return (

        <div className="flex flex-col mt-4">
            {profile.data?.comments?.map((post => (
                <ObserverPost post={post} section="user" relatedTitle={post.relatedTitle} />
            )))}
        </div>
    )
}