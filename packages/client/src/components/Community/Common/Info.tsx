import type { Community } from "@/types/community";
import { Cake, Earth } from "lucide-react";
import RulesPart from "./Info/Rules";

export default function Info({ community }: { community: Community }) {
    return (
        <div className="w-full px-8 col-span-1">
            <div className="bg-[#04090a] flex flex-col shadow p-4 rounded-lg gap-4">
                <h1 className="font-bold text-gray-300">{community.name}</h1>
                <p className="text-muted-foreground wrap-break-word whitespace-pre-wrap">{community.description}</p>

                <div className="flex items-center text-muted-foreground gap-3">
                    <Cake className="w-5" />
                    <p className="text-xs">Created {new Date(community.createdAt as string).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center text-muted-foreground gap-3">
                    <Earth className="w-5" />
                    <p className="text-xs">{community.visibility == "private" ? "Private" : "Public"}</p>
                </div>

                <RulesPart community={community} />
            </div>
        </div>
    )
}