import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const nav = useNavigate();
    return (
        <div className="flex flex-col gap-2 py-8">
            <h1 className="text-2xl font-bold text-white/50">Settings</h1>
            <div className="flex gap-1 border-b py-3 border-gray-400/50">
                <div className="flex gap-2">
                    <div
                        onClick={() => nav("/settings/account")}
                        className={cn("hover:bg-[#444]/70 transition-all text-gray-200 font-semibold px-5 py-2 cursor-pointer rounded-full border-[#444]", window.location.href.endsWith("/account") ? "bg-[#444]/50" : "border")}>
                        Account
                    </div>
                </div>
                <div className="flex gap-2">
                    <div
                        onClick={() => nav("/settings/profile")}
                        className={cn("hover:bg-[#444]/70 transition-all text-gray-200 font-semibold px-5 py-2 cursor-pointer rounded-full border-[#444]", window.location.href.endsWith("/profile") ? "bg-[#444]/50" : "border")}>
                        Profile
                    </div>
                </div>
            </div>

            {children}
        </div>
    )
}