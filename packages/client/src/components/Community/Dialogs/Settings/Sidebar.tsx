import { cn } from "@/lib/utils";
import { Settings, Shield } from "lucide-react";

export default function CommunitySettingsSidebar({ page, setPage }: { page: string, setPage: React.Dispatch<React.SetStateAction<string>> }) {
    const isOpen = (name: string) => page == name ? "bg-[#333]" : ""
    return (
        <div className="bg-[#222] max-w-1/6 p-4 flex-1 h-full rounded-lg">
            <div className="flex flex-col my-4 gap-4">
                <h1 className="text-muted-foreground uppercase px-3" style={{ letterSpacing: "0.1rem" }}>Settings</h1>
                <div
                    onClick={() => setPage("general")}
                    className={cn("hover:bg-[#333]/20 transition cursor-pointer w-full flex py-3 xl:px-4 rounded-lg gap-2 text-sm items-center", isOpen("general"))}>
                    <Settings className="w-8" />
                    General Settings
                </div>

                <div
                    onClick={() => setPage("privacy")}
                    className={cn("hover:bg-[#333]/20 transition cursor-pointer w-full flex py-3 xl:px-4 rounded-lg gap-2 text-sm items-center", isOpen("privacy"))}>
                    <Shield className="w-8" />
                    Privacy
                </div>


            </div>
        </div>
    )
}