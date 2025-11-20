import ObserverPost from "@/components/Community/Post/Post";
import Layout from "@/components/Layout/layout";
import Loading from "@/components/Loading/Loading";
import { UserAvatar } from "@/components/User/Avatar";
import type { User } from "@/types/user";
import { updateUserProfilePicture, useUser, useUserProfile } from "@/utils/api/users";
import dateToStr from "@/utils/date/dateToStr";
import { Image } from "lucide-react";
import { useRef } from "react";
import { useParams } from "react-router-dom";

export default function User() {
    const { name } = useParams();
    const profile = useUserProfile(name!);
    const user = useUser();
    const fileInputRef = useRef<HTMLInputElement>(null)
    const changePicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const form = new FormData();
        form.append("picture", file);

        await updateUserProfilePicture(form)
    }

    return (
        <Layout>
            {profile.isLoading && <Loading /> ||
                <div className="mt-8 grid grid-cols-3 gap-4 min-h-screen">
                    <div className="w-full col-span-2 flex flex-col">
                        <div className="flex items-center gap-4 px-4">
                            <div className="relative w-16 h-16">
                                <UserAvatar user={profile.data as User} className="w-16 h-16 text-2xl border-2 border-[#333]" />
                                {profile.data?.id == user.data?.user?.id && (
                                    <>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute right-0 bottom-0 bg-[#333] p-1 px-2 rounded-full cursor-pointer">
                                            <Image className="w-4" />
                                        </div>

                                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={changePicture} />
                                    </>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-xl text-gray-200 font-bold">
                                    {profile.data?.displayName}
                                </h1>
                                <div className="text-lg text-gray-400 font-semibold">
                                    u/{profile.data?.username}
                                </div>
                            </div>
                        </div>


                        <div className="flex mt-6 gap-2">
                            <div className="hover:bg-[#444]/70 transition-all text-gray-200 font-semibold bg-[#444]/50 px-5 py-2 cursor-pointer rounded-full">
                                Overview
                            </div>
                        </div>

                        <div className="flex flex-col mt-4">
                            {profile.data?.posts?.map((post => (
                                <ObserverPost post={post} section="user" />
                            )))}

                        </div>
                    </div>

                    <div className="w-full col-span-1 overflow-auto px-8">
                        <div className="bg-[#04090a] flex w-full flex-col shadow rounded-lg">
                            <div className="relative bg-linear-to-b from-orange-500/70 to-[#04090a] h-24 rounded-t-lg" />
                            <div className="p-4 flex flex-col gap-4">
                                <h1 className="text-gray-200 font-bold">{profile.data?.displayName}</h1>

                                <div className="grid grid-cols-2 text-xs">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">{profile.data?.rep}</span>
                                        <h1 className="text-white/50">Reputation</h1>
                                    </div>
                                    {profile.data?.createdAt &&
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">{dateToStr(profile.data.createdAt).replace("ago", "")}</span>
                                            <h1 className="text-white/50">Account Age</h1>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </Layout>
    )
}