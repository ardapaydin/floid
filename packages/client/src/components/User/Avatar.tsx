import type { ComponentProps } from "react";
import type { User } from "../../types/user";
import { cn } from "@/lib/utils";
export function UserAvatar({ user, ...props }: {
    user: User,
} & ComponentProps<'div'>) {
    const firstLetter = user.displayName.slice(0, 1).toUpperCase();
    return (
        <div  {...props} className={cn("bg-orange-500/50 select-none rounded-full w-8 h-8 text-white flex items-center justify-center", props.className)}>
            {firstLetter}
        </div>
    )
}