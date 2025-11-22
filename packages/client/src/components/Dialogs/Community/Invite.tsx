import Loading from "@/components/Loading/Loading";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGenerateInviteLink } from "@/utils/api/community";
import { useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

export default function InviteDialog({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const { name } = useParams();
    const [maxUses, setMaxUses] = useState(50);
    const inviteLink = useGenerateInviteLink(name!, isOpen, maxUses);
    const inviteUrl = window.location.origin + "/invite/" + inviteLink.data?.id;
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="bg-[#242424]">
                {inviteLink.isLoading ? (
                    <Loading />
                ) : (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">Invite Members</h3>
                        <p className="text-sm text-white/50">Share this link to invite others to your community</p>
                        <div className="flex items-center">
                            <input
                                readOnly
                                value={inviteUrl}
                                className="px-2 py-2 w-full rounded-lg rounded-r-none bg-[#333] text-white focus:outline-none transition"
                            />
                            <button
                                className="px-4 py-2 bg-[#444] text-white cursor-pointer hover:bg-[#444]/80 rounded-l-none rounded-lg hover:bg-brand-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => {
                                    if (!inviteUrl) return
                                    navigator.clipboard.writeText(inviteUrl);
                                    toast.success("Copied to clipboard!");
                                }}
                            >
                                Copy
                            </button>
                        </div>

                        <div className="flex items-center justify-between w-full bg-[#666]/20 rounded-lg p-2">
                            <div className="flex flex-col items-start w-full">
                                <h1>Max Uses</h1>
                                <p className="text-sm text-white/50">Limit how many times this invite can be used</p>
                            </div>

                            <Select value={String(maxUses)} onValueChange={(val) => setMaxUses(parseInt(val))}>
                                <SelectTrigger className="w-32 bg-[#444] border-none rounded-lg cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#333] border-0 rounded-lg">
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}