import DisplayAttachments from "@/components/Dialogs/Post/DisplayAttachments";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/post";
import { useState } from "react";

export function Attachments({ post }: { post: Post }) {
    const [index, setIndex] = useState(0);
    return (
        <DisplayAttachments post={post} index={index} setIndex={setIndex}>
            <div className="flex w-full rounded justify-center cursor-pointer relative overflow-hidden">
                <img src={import.meta.env.VITE_CDN_URL + "/" + post.attachments[index].url} className="max-w-96 max-h-96" draggable={false} />
                <img src={import.meta.env.VITE_CDN_URL + "/" + post.attachments[index].url} className="absolute w-full h-full rounded -z-10 object-cover blur-xl opacity-50" draggable={false} />

                <div className="absolute bottom-2 bg-black/50 p-2 rounded-full left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-2">
                        {Boolean(post.attachments.length > 1) && post.attachments.map((_attachment, i) => (
                            <div onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault()
                                setIndex(i)
                            }} className={cn("bg-white/30 w-2 rounded-full cursor-pointer h-2", index == i ? "bg-white" : "")} />
                        ))}
                    </div>
                </div>
            </div>
        </DisplayAttachments>
    )
}