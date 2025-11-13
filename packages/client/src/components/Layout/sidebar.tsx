import { Home, Plus } from "lucide-react";

export function Sidebar() {
    return (
        <div className="h-full border-[#3b3b3b] min-w-1/7 border-r p-4">
            <div className="flex flex-col text-white/90">
                <div className="hover:bg-[#333]/20 transition cursor-pointer flex py-2 px-4 rounded-lg gap-2 text-sm items-center">
                    <Home className="w-8" />
                    Home
                </div>

                <hr className="mt-4 mb-4 border-gray-800/50" />

                <div className="flex flex-col mx-4">
                    <h1 className="uppercase text-xs text-gray-300/50" style={{ letterSpacing: "0.03rem" }}>Communities</h1>
                </div>

                <div className="hover:bg-[#333]/20 mt-4 transition cursor-pointer flex py-2 px-4 rounded-lg gap-2 text-sm items-center">
                    <Plus className="w-8" />
                    Create Community
                </div>

            </div>
        </div>
    )
}