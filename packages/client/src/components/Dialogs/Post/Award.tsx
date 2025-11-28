import Loading from "@/components/Loading/Loading";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Award } from "@/types/award";
import type { Post } from "@/types/post";
import { useAwards, useBalance } from "@/utils/api/awards";
import { Coins } from "lucide-react";
import { useState } from "react";
export function AwardDialog({ children, post }: { children: React.ReactNode, post: Post }) {
    const [isOpen, setIsOpen] = useState(false);
    const awards = useAwards(isOpen)
    const balance = useBalance(isOpen);

    const [selectedAward, setSelectedAward] = useState<Award>();

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader className="justify-between flex items-center flex-row px-4">
                    <DialogTitle>Award this Post</DialogTitle>
                    <div className="bg-[#242323] p-1 px-2 flex text-xs items-center gap-3 rounded-lg">
                        <Coins className="w-4 text-yellow-400" />
                        {balance.data?.balance}
                    </div>
                </DialogHeader>

                {(awards.isLoading || balance.isLoading) && <Loading /> || (
                    <div className="flex flex-col">
                        <div className="flex flex-wrap gap-8 justify-center py-4">
                            {awards.data?.sort((a, b) => a.reputation - b.reputation).map((award) => (
                                <div
                                    onClick={() => setSelectedAward(award)}
                                    className={cn("flex flex-col p-2 px-4 items-center hover:bg-[#242323] transition cursor-pointer rounded-lg", award.id == selectedAward?.id ? "bg-[#242323]" : "")}>
                                    <div className="text-4xl">
                                        {award.emoji}
                                    </div>
                                    <div className="flex gap-1 items-center text-xs">
                                        {award.reputation} <Coins className="w-4 text-yellow-300" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="justify-end flex border-t border-[#555] py-2">
                            <button
                                disabled={!selectedAward}
                                className="mt-4 px-4 justify-center items-center flex disabled:opacity-50 disabled:hover:bg-orange-500 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                                Award
                            </button>

                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}