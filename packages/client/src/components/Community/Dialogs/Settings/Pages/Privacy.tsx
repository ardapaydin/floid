import { cn } from "@/lib/utils";
import type { Community } from "@/types/community";
import { updateCommunity, useCommunityByName } from "@/utils/api/community";
import { useQueryClient } from "@tanstack/react-query";
import { Earth, EyeClosed } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function PrivacyPage() {
    const { name } = useParams();
    const community = useCommunityByName(name!)
    const qc = useQueryClient();
    const nav = useNavigate();
    const update = async (field: string, value?: string) => {
        if (!name) return;
        const req = await updateCommunity(name, { [field]: value })
        if (req.status == 200) {
            if (field == "name") {
                nav("/c/" + value);
            }

            qc.setQueryData(["communities", field == "name" ? value : name], (old: Community) => ({
                ...old,
                ...community,
                [field]: value
            }))
            qc.invalidateQueries({ queryKey: ["communities"] })
        }
    }
    if (!community.data) return
    return (
        <div className="flex flex-col flex-1 min-h-full">
            <h1 className="my-4 text-2xl font-bold">Privacy</h1>
            <div className="flex flex-col relative gap-4">
                <div
                    onClick={() => update("visibility", "public")}
                    className="border-[#1d1d1d]/50 shadow-lg bg-[#242424]/60 hover:bg-[#242424] transition rounded-lg cursor-pointer items-center gap-2 border-2 p-4 flex">
                    <div
                        className={cn("border-2 border-muted-foreground/50 w-6 h-6 rounded-full", community.data.visibility === "public" ? "bg-green-500" : "")}
                    />

                    <div className="flex flex-col">
                        <div className="flex font-bold gap-2">
                            <Earth className="w-4 text-muted-foreground" />
                            <p>Public</p>
                        </div>

                        <p className="text-muted-foreground text-sm">Anyone on the platform can view and join this community</p>
                    </div>
                </div>
                <div
                    onClick={() => update("visibility", "private")}
                    className="border-[#1d1d1d]/50 shadow-lg bg-[#242424]/60 hover:bg-[#242424] transition rounded-lg cursor-pointer items-center gap-2 border-2 p-4 flex">
                    <div
                        className={cn("border-2 border-muted-foreground/50 w-6 h-6 rounded-full", community.data.visibility === "private" ? "bg-green-500" : "")}
                    />

                    <div className="flex flex-col">
                        <div className="flex font-bold gap-2">
                            <EyeClosed className="w-4 text-muted-foreground" />
                            <p>Private</p>
                        </div>

                        <p className="text-muted-foreground text-sm">Only members can view and participate in this community</p>
                    </div>
                </div>
            </div>
        </div>
    )
}