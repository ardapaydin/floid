import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../../utils/api/users"
import UserDropdownMenu from "../Dropdown/User";
import { UserAvatar } from "../User/Avatar";
import { Search } from "lucide-react";

export default function Navbar() {
    const user = useUser();
    const nav = useNavigate();
    const [q, set] = useSearchParams()

    return (
        <div className="w-full py-2 px-8 border-b border-[#3b3b3b]">
            <div className="w-full flex justify-between items-center">
                <h1 className="text-2xl font-bold">floid</h1>
                <div className="flex">
                    <div className="flex focus-within:ring-2 rounded-full items-center focus-within:ring-orange-400/50 transition">
                        <div className="py-2 px-4 bg-[#313131] rounded-full rounded-r-none border-b-3 border-[#242323]">
                            <Search />
                        </div>
                        <input
                            type="text"
                            value={q.get("q") || ""}
                            onChange={(e) => {
                                set({ ...q, q: e.target.value })
                            }}
                            autoComplete="off"
                            placeholder="Search"
                            className="px-2 py-2 pr-32 rounded-full rounded-l-none w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') if (e.currentTarget.value.trim()) nav(`/search?q=${encodeURIComponent(e.currentTarget.value.trim())}`);
                            }}
                        />
                    </div>

                </div>
                <div className="flex gap-2">
                    {!user.data?.user && (
                        <button
                            onClick={() => window.location.href = "/login"}
                            className="bg-orange-600/80 hover:bg-orange-600 transition cursor-pointer rounded-full px-4 py-2">
                            Login
                        </button>
                    ) || (user.data?.user) && (
                        <div className="flex gap-2 items-center">
                            <UserDropdownMenu>
                                <div>
                                    <UserAvatar user={user.data?.user} className="cursor-pointer w-8 h-8" />
                                </div>
                            </UserDropdownMenu>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}