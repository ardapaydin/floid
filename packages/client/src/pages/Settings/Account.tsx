import Layout from "@/components/Layout/layout";
import SettingsLayout from "./Layout";
import { useUser } from "@/utils/api/users";
import { ChevronRightIcon } from "lucide-react";
import UpdateEmail from "@/components/Dialogs/Settings/UpdateEmail";
import UpdatePassword from "@/components/Dialogs/Settings/UpdatePassword";
import { DeleteAccount } from "@/components/Dialogs/Settings/DeleteAccount";
import BlockedUsers from "@/components/Dialogs/Settings/BlockedUsers";

export default function AccountSettings() {
    const user = useUser();
    return (
        <Layout>
            <SettingsLayout>
                <h2 className="text-lg font-semibold">General</h2>
                <div className="py-2 gap-4">
                    <UpdateEmail>
                        <div className="w-full group text-sm cursor-pointer py-2 text-white/90 justify-between flex">
                            <span>Email Address</span>
                            <div className="flex gap-2 text-xs items-center">
                                <p>{user.data?.user?.email}</p>
                                <div className="group-hover:bg-[#333] rounded-full p-0.5 px-1.5 transition-all duration-300">
                                    <ChevronRightIcon className="w-4" />
                                </div>
                            </div>
                        </div>
                    </UpdateEmail>

                    <UpdatePassword>
                        <div className="w-full group text-sm cursor-pointer py-2 text-white/90 justify-between flex">
                            <span>Password</span>
                            <div className="flex gap-2 text-xs items-center">
                                <div className="group-hover:bg-[#333] rounded-full p-0.5 px-1.5 transition-all duration-300">
                                    <ChevronRightIcon className="w-4" />
                                </div>
                            </div>
                        </div>
                    </UpdatePassword>
                    <h2 className="text-lg font-semibold mt-4">Social</h2>

                    <BlockedUsers>
                        <div className="w-full group text-sm cursor-pointer py-2 text-white/90 justify-between flex">
                            <span>Blocked Users</span>
                            <div className="flex gap-2 text-xs items-center">
                                <p>{user?.data?.blocked?.length} Blocked</p>
                                <div className="group-hover:bg-[#333] rounded-full p-0.5 px-1.5 transition-all duration-300">
                                    <ChevronRightIcon className="w-4" />
                                </div>
                            </div>
                        </div>
                    </BlockedUsers>


                    <h2 className="text-lg font-semibold mt-4">Advanced</h2>
                    <DeleteAccount>
                        <div className="w-full group text-sm cursor-pointer py-2 text-white/90 justify-between flex">
                            <span>Delete Account</span>
                            <div className="flex gap-2 text-xs items-center">
                                <div className="group-hover:bg-[#333] rounded-full p-0.5 px-1.5 transition-all duration-300">
                                    <ChevronRightIcon className="w-4" />
                                </div>
                            </div>
                        </div>
                    </DeleteAccount>
                </div>
            </SettingsLayout>
        </Layout>
    )
}