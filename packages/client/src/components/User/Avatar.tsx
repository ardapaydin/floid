import type { ComponentProps } from "react";
import type { User } from "../../types/user";
import { cn } from "@/lib/utils";
export function UserAvatar({ user, ...props }: {
    user: User,
} & (ComponentProps<'div'> | ComponentProps<'img'>)) {
    const firstLetter = user.displayName.slice(0, 1).toUpperCase();
    if (user.profilePicture) return <img src={import.meta.env.VITE_CDN_URL + "/profilePicture/" + user.profilePicture} className={cn("rounded-full w-8 h-8", props.className)} draggable={false} />
    return (
        <div  {...props} className={cn("bg-orange-500/50 select-none rounded-full w-8 h-8 text-white flex items-center justify-center", props.className)}>
            {firstLetter}
        </div>
    )
}