import { CommunityIcon } from "@/components/Community/Common/Icon";
import Loading from "@/components/Loading/Loading";
import { UserAvatar } from "@/components/User/Avatar";
import { joinWithInviteLink, useInviteLink } from "@/utils/api/invite";
import { useUser } from "@/utils/api/users";
import toast from "react-hot-toast";
import { Navigate, useNavigate, useParams } from "react-router-dom"

export function Invite() {
    const { id } = useParams();
    const invite = useInviteLink(id!);
    const user = useUser();
    const nav = useNavigate();
    const join = async () => {
        const r = await joinWithInviteLink(id!);
        if (r.status == 200) nav("/c/" + invite.data?.community?.name)
        else toast.error(r.data?.message)
    }

    if (invite.isLoading || !invite.data) return <Loading />
    if (!user.isLoading && !user.data?.user) return <Navigate to={"/login"} />
    if (invite.data?.message) {
        toast.error(invite.data.message);
        if (!invite.data?.navigate) return <Navigate to={"/"} />
    }
    if (invite.data?.navigate) return <Navigate to={invite.data.navigate} />
    return (
        <div className="flex flex-col justify-center items-center h-screen w-screen ">
            <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,165,0,0.3),rgba(255,255,255,0))]" />
            {invite.data.community.banner && <img src={import.meta.env.VITE_CDN_URL + "/banners/" + invite.data.community.banner} className="absolute z-[-1] w-screen h-screen overflow-hidden object-cover blur-lg" />}
            <div className="p-8 bg-[#333] rounded-lg items-center justify-center flex flex-col">
                <CommunityIcon community={invite.data.community} className="w-16 h-16" />
                <div className="flex items-center gap-1 mt-4">
                    <h1 className="text-xl font-bold text-white text-center">
                        You've been invited to join
                    </h1>
                    <h2 className="text-lg font-semibold text-orange-400">
                        c/{invite.data.community.name}
                    </h2>
                </div>

                <div className="bg-[#444] rounded-full items-center flex gap-1 px-2 py-0.5">
                    <p className="text-xs">Invited by</p>
                    <div className="flex items-center gap-1">
                        <p className="text-sm text-white/80">u/{invite.data.creator.username}</p>
                        <UserAvatar user={invite.data.creator} className="w-6 h-6" />
                    </div>
                </div>

                <p className="text-gray-300 text-sm mt-2 text-center">
                    Accept this invitation to become a member of this community
                </p>

                <button
                    onClick={() => join()}
                    className="mt-4 px-4 justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                    Accept
                </button>

            </div>
        </div>
    )
}