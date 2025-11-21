import Loading from "@/components/Loading/Loading";
import { cn } from "@/lib/utils";
import type { Community } from "@/types/community";
import type { Rule } from "@/types/rule";
import { useCommunityRules } from "@/utils/api/community";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function RulesPart({ community }: { community: Community }) {
    const rules = useCommunityRules(community.name);
    if (!rules.isLoading && !rules.data?.length) return;
    return (
        <div className="flex flex-col gap-2">
            <hr className="border-gray-700/50" />

            <h1 className="uppercase text-sm text-muted-foreground">c/{community.name} rules</h1>

            <div className="flex flex-col gap-4">
                {rules.isLoading && <Loading />}
                {!rules.isLoading && rules.data && rules.data.map((rule, index) => <Rule i={index} rule={rule} />)}
            </div>
        </div>
    )
}

function Rule({ rule, i }: { rule: Rule, i: number }) {
    const [isExpended, setIsExpended] = useState(false);
    return (
        <div className="flex justify-between transition cursor-pointer hover:bg-white/5 rounded-lg p-2" onClick={() => setIsExpended((e) => !e)}>
            <div className="flex gap-2 items-center">
                <p className="text-white/50">{i + 1}.</p>
                <div className="flex flex-col">
                    <h1 className="text-sm text-white/50">{rule.title}</h1>
                    {isExpended &&
                        <p className="text-white/50 text-xs wrap-break-word w-64">{rule.content}</p>
                    }
                </div>
            </div>

            <ChevronDown className={cn("transition w-4", !isExpended ? "-rotate-90" : "rotate-0")} />
        </div>
    )
}