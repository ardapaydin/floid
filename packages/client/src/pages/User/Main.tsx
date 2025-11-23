import Layout from "@/components/Layout/layout";
import Loading from "@/components/Loading/Loading";
import { UserAvatar } from "@/components/User/Avatar";
import type { User } from "@/types/user";
import { blockUser, followUser, unblockUser, unfollowUser, updateUserBanner, updateUserProfilePicture, useUser, useUserProfile } from "@/utils/api/users";
import dateToStr from "@/utils/date/dateToStr";
import { useQueryClient } from "@tanstack/react-query";
import { Image, Pencil } from "lucide-react";
import { useRef } from "react";
import { useParams } from "react-router-dom";
import MainSections from "./Sections/Main";

export default function User() {
    const { name } = useParams();
    const profile = useUserProfile(name!);
    const user = useUser();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerRef = useRef<HTMLInputElement>(null);
    const qc = useQueryClient();
    const changePicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const form = new FormData();
        form.append("picture", file);
        const r = await updateUserProfilePicture(form)

        if (r.status == 200) qc.setQueryData(["users", name, "profile"], (old: User) => ({
            ...old,
            profilePicture: r.data.key
        }))
    }
    const changeBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const form = new FormData();
        form.append("banner", file);
        const r = await updateUserBanner(form)

        if (r.status == 200) qc.setQueryData(["users", name, "profile"], (old: User) => ({
            ...old,
            banner: r.data.key
        }))
    }

    const triggerFollow = async () => {
        if (!name) return
        if (profile.data?.following) {
            const r = await unfollowUser(name)
            if (r.status == 200) qc.setQueryData(["users", name, "profile"], (old: (User & { followers: number })) => ({
                ...old,
                following: false,
                followers: old.followers - 1
            }))
        }
        else {
            const r = await followUser(name)
            if (r.status == 200) qc.setQueryData(["users", name, "profile"], (old: (User & { followers: number })) => ({
                ...old,
                following: true,
                followers: old.followers + 1
            }))
        }
    }
    const blocked = user?.data?.blocked?.find((x) => x == profile.data?.id)
    const triggerBlock = async () => {
        if (!name) return
        if (!blocked) {
            const r = await blockUser(name)
            if (r.status == 200) qc.setQueryData(["users", "me"], (old: { blocked: string[] }) => ({
                ...old,
                blocked: [...old.blocked, profile.data?.id]
            }))
        } else {
            const r = await unblockUser(name);
            if (r.status == 200) qc.setQueryData(["users", "me"], (old: { blocked: string[] }) => ({
                ...old,
                blocked: old.blocked.filter(x => x != profile.data?.id)
            }))
        }
    }

    return (
        <Layout>
            {profile.isLoading && <Loading /> ||
                <div className="mt-8 md:grid grid-cols-3 gap-4 min-h-screen">
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
                        <MainSections />
                    </div>

                    <div className="w-full col-span-1 overflow-auto px-8">
                        <div className="bg-[#04090a] flex w-full flex-col shadow rounded-lg">
                            <div className="relative bg-linear-to-b from-orange-500/70 to-[#04090a] h-24 rounded-t-lg" >
                                {profile.data?.banner && <img src={import.meta.env.VITE_CDN_URL + "/banner/" + profile.data.banner} className="w-full h-full object-cover rounded-t-lg" draggable={false} />}
                                {profile.data?.id == user.data?.user?.id && (
                                    <div className="bottom-0 absolute p-4 right-0 z-10">
                                        <Pencil className="w-4 cursor-pointer" onClick={() => bannerRef.current?.click()} />
                                        <input ref={bannerRef} type="file" className="hidden" accept="image/*" onChange={changeBanner} />
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex flex-col gap-4">
                                <h1 className="text-gray-200 font-bold">{profile.data?.displayName}</h1>
                                {profile.data?.id != user.data?.user?.id && (
                                    <div className="flex items-center gap-1 justify-between" >
                                        <button
                                            hidden={Boolean(blocked)}
                                            onClick={() => triggerFollow()}
                                            className="px-2 justify-center items-center text-xs flex disabled:opacity-50 disabled:hover:bg-orange-500 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-1 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                                            {profile.data?.following ? "Unfollow" : "Follow"}
                                        </button>
                                        <button
                                            onClick={() => triggerBlock()}
                                            className="px-2 justify-center items-center text-xs flex disabled:opacity-50 disabled:hover:bg-orange-500 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-1 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                                            {blocked ? "Unblock" : "Block"}
                                        </button>

                                    </div>
                                )}
                                <div className="grid grid-cols-2 text-xs space-y-4">
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

                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">{profile.data?.followers}</span>
                                        <h1 className="text-white/50">Followers</h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </Layout>
    )
}