import Layout from "@/components/Layout/layout";
import SettingsLayout from "./Layout";
import { updateUserBanner, updateUserProfilePicture, useUser } from "@/utils/api/users";
import { ChevronRightIcon } from "lucide-react";
import UpdateDisplayName from "@/components/Dialogs/Settings/UpdateDisplayName";
import { useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types/user";

export default function ProfileSettings() {
    const user = useUser();
    const avatarRef = useRef<HTMLInputElement>(null);
    const bannerRef = useRef<HTMLInputElement>(null)
    const qc = useQueryClient()
    const changeavatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const form = new FormData();
        form.append("picture", file);

        const r = await updateUserProfilePicture(form)
        if (r.status == 200) qc.setQueryData(["users", "me"], (old: { user: User }) => ({
            ...old,
            user: {
                ...old.user,
                profilePicture: r.data.key
            }
        }))
    }

    const changebanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const form = new FormData();
        form.append("banner", file);

        const r = await updateUserBanner(form);
        if (r.status == 200) qc.setQueryData(["users", "me"], (old: { user: User }) => ({
            ...old,
            user: {
                ...old.user,
                banner: r.data.key
            }
        }))
    }

    return (
        <Layout>
            <SettingsLayout>
                <h2 className="text-lg font-semibold">General</h2>
                <div className="py-2 gap-4">
                    <UpdateDisplayName>
                        <div className="w-full group text-sm cursor-pointer py-2 text-white/90 justify-between flex">
                            <span>Display Name</span>
                            <div className="flex gap-2 text-xs items-center">
                                <p>{user.data?.user?.displayName}</p>
                                <div className="group-hover:bg-[#333] rounded-full p-0.5 px-1.5 transition-all duration-300">
                                    <ChevronRightIcon className="w-4" />
                                </div>
                            </div>
                        </div>
                    </UpdateDisplayName>

                    <div
                        onClick={() => avatarRef.current?.click()}
                        className="w-full group text-sm cursor-pointer py-2 text-white/90 justify-between flex">
                        <span>Avatar</span>
                        <div
                            className="flex gap-2 text-xs items-center">
                            <div className="group-hover:bg-[#333] rounded-full p-0.5 px-1.5 transition-all duration-300">
                                <ChevronRightIcon className="w-4" />
                            </div>
                        </div>

                        <input onChange={changeavatar} ref={avatarRef} type="file" className="hidden" accept="image/*" />
                    </div>

                    <div
                        onClick={() => bannerRef.current?.click()}
                        className="w-full group text-sm cursor-pointer py-2 text-white/90 justify-between flex">
                        <span>Banner</span>
                        <div className="flex gap-2 text-xs items-center">
                            <div className="group-hover:bg-[#333] rounded-full p-0.5 px-1.5 transition-all duration-300">
                                <ChevronRightIcon className="w-4" />
                            </div>
                        </div>

                        <input ref={bannerRef} onChange={changebanner} type="file" className="hidden" accept="image/*" />
                    </div>

                </div>
            </SettingsLayout>
        </Layout>
    )
}