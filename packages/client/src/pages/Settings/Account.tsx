import Layout from "@/components/Layout/layout";
import SettingsLayout from "./Layout";
import { useUser } from "@/utils/api/users";
import { ChevronRightIcon } from "lucide-react";
import UpdateEmail from "@/components/Dialogs/Settings/UpdateEmail";

export default function AccountSettings() {
    const user = useUser();
    return (
        <Layout>
            <SettingsLayout>
                <h2 className="text-lg font-semibold">General</h2>
                <div className="py-2 gap-4">
                    <UpdateEmail>
                        <div className="w-full group text-sm cursor-pointer text-white/90 justify-between flex">
                            <span>Email Address</span>
                            <div className="flex gap-2 text-xs items-center">
                                <p>{user.data?.user?.email}</p>
                                <div className="group-hover:bg-[#333] rounded-full p-0.5 px-1.5 transition-all duration-300">
                                    <ChevronRightIcon className="w-4" />
                                </div>
                            </div>
                        </div>
                    </UpdateEmail>
                </div>
            </SettingsLayout>
        </Layout>
    )
}