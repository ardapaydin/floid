import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import CommunitySettingsSidebar from "./Sidebar";
import GeneralPage from "./Pages/General";
export default function CommunitySettings({ children }: { children: React.ReactNode }) {

    const [page, setPage] = useState("general")
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="flex p-0 min-w-[calc(200vh-30px)] h-[calc(100vh-30px)]">
                <div className="flex flex-1 min-h-0">
                    <CommunitySettingsSidebar page={page} setPage={setPage} />

                    <div className="flex flex-col flex-1 h-full relative overflow-auto">
                        <div className="p-4 py-12 mx-auto w-full max-w-7xl">
                            {page == "general" && <GeneralPage />}
                        </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}