import { useUser } from "../../utils/api/users"
import UserDropdownMenu from "../Dropdown/User";
import { UserAvatar } from "../User/Avatar";

export default function Navbar() {
    const user = useUser();
    return (
        <div className="w-full py-4 px-4 border-b border-[#3b3b3b]">
            <div className="w-full flex justify-between">
                <h1 className="text-2xl font-bold">floid</h1>

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
                                <UserAvatar user={user.data?.user} className="cursor-pointer" />
                            </UserDropdownMenu>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}