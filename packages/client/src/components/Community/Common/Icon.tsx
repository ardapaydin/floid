import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import type { Community } from "@/types/community";
export function CommunityIcon({ community, ...props }: {
    community: Community,
} & (ComponentProps<'div'> | ComponentProps<'img'>)) {
    const firstLetter = community.name.slice(0, 1).toUpperCase();
    if (community.icon) return <img src={import.meta.env.VITE_CDN_URL + "/icons/" + community.icon} className={cn("rounded-full w-full h-full ", props.className)} />
    return (
        <div  {...props} className={cn("bg-white select-none rounded-full w-full h-full text-black font-bold text-sm flex items-center justify-center", props.className)}>
            c/{firstLetter}
        </div>
    )
}