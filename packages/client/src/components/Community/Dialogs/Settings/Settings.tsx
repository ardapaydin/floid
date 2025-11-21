import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import CommunitySettingsSidebar from "./Sidebar";
import GeneralPage from "./Pages/General";
import PrivacyPage from "./Pages/Privacy";
import RulesPage from "./Pages/Rules";
export default function CommunitySettings({ children }: { children: React.ReactNode }) {

    const [page, setPage] = useState("general")
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="flex p-0 min-w-[calc(150vh-30px)] h-[calc(90vh-30px)]">
                <div className="flex flex-1 min-h-0">
                    <CommunitySettingsSidebar page={page} setPage={setPage} />

                    <div className="flex flex-col flex-1 h-full relative overflow-auto">
                        <div className="p-8 py-12 mx-auto w-full max-w-7xl">
                            {page == "general" && <GeneralPage />}
                            {page == "privacy" && <PrivacyPage />}
                            {page == "rules" && <RulesPage />}
                        </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}