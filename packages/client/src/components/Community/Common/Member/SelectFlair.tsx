import Loading from "@/components/Loading/Loading";
import { UserAvatar } from "@/components/User/Avatar";
import { cn } from "@/lib/utils";
import { useFlairs } from "@/utils/api/flairs";
import { setFlair, useMembersMe } from "@/utils/api/members";
import { useUser } from "@/utils/api/users"
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { FlairView } from "./Flair";
import type { Flair } from "@/types/flair";
import { useQueryClient } from "@tanstack/react-query";

export function SelectFlair() {
    const user = useUser();
    const { name } = useParams();
    const flairs = useFlairs(name!)
    const me = useMembersMe(name!);
    const [isExpended, setIsExpended] = useState(false);
    const qc = useQueryClient();
    const set = async (flair: Flair) => {
        const r = await setFlair(name!, flair.id);
        if (r.status == 200) qc.setQueryData(["communities", name!, "members", "me"], (old: { flair: Flair }) => ({ ...old, flair }))
    }

    if (!user?.data?.user || !me?.data) return <Loading />
    return (
        <div className="flex flex-col">
            <div className="flex items-center cursor-pointer px-2 py-0.5 rounded-lg transition-all hover:bg-[#333]/50 justify-between" onClick={() => setIsExpended((old) => !old)}>
                <div className="flex items-center gap-2" onClick={() => setIsExpended((old) => !old)}>
                    <UserAvatar user={user.data?.user} />
                    <h1>u/{user.data.user.username}</h1>
                    {me.data.flair && <FlairView flair={me.data.flair} />}
                </div>
                <ChevronDown className={cn("transition-all", isExpended ? "rotate-180" : "rotate-0")} />
            </div>

            {isExpended && (
                <div className="bg-[#444]/50 p-2 py-4 mt-4 rounded-lg flex flex-col gap-2">
                    {flairs.data?.filter(x => (me.data.role === "mod" || me.data.role === "owner") || !x.modOnly).map((flair) => (
                        <div className="justify-between flex items-center">
                            <FlairView flair={flair} />

                            <div
                                onClick={() => set(flair)}
                                className={cn("w-4 h-4 border-3 rounded-full border-black cursor-pointer justify-center items-center", flair.id == me.data.flair?.id && "border-green-500")}>
                                {flair.id == me.data.flair?.id && <div className="w-full h-full rounded-full bg-green-500" />}
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}