import { Home } from "lucide-react";

export function Sidebar() {
    return (
        <div className="h-full border-[#3b3b3b] min-w-1/7 border-r p-4">
            <div className="flex flex-col text-white/90">
                <div className="hover:bg-[#333]/20 transition cursor-pointer flex py-2 px-4 rounded-lg gap-2 text-sm items-center">
                    <Home className="w-8" />
                    Home
                </div>
            </div>
        </div>
    )
}