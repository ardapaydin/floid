import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { Post } from "@/types/post";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function DisplayAttachments({ children, post, index, setIndex }: { children: React.ReactNode, post: Post, index: number, setIndex: React.Dispatch<React.SetStateAction<number>> }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="p-0 bg-transparent">
                <div className="flex w-full rounded justify-center relative overflow-hidden">
                    <img src={import.meta.env.VITE_CDN_URL + "/" + post.attachments[index].url} className="max-w-96 max-h-96" draggable={false} />
                    {post.attachments.length > 1 && index > 0 && (
                        <button
                            onClick={() => setIndex(index - 1)}
                            className="absolute left-0 top-1/2 cursor-pointer -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                        >
                            <ChevronLeft />
                        </button>
                    )}

                    {post.attachments.length > 1 && index < post.attachments.length - 1 && (
                        <button
                            onClick={() => setIndex(index + 1)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                        >
                            <ChevronRight />
                        </button>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    )
}