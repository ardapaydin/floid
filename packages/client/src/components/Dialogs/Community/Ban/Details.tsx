import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Ban } from "@/types/ban";
import { unbanMember } from "@/utils/api/members";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

export default function BanDetails({ children, ban }: { children: React.ReactNode, ban: Ban }) {
    const { name } = useParams();
    const qc = useQueryClient();
    const unban = async () => {
        const r = await unbanMember(name!, ban.userId);
        if (r.status == 200) qc.setQueryData(["communities", name!, "members", "ban"], (old: Ban[]) => (old.filter(x => x.id != ban.id)))
        else toast.error(r.data?.message)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="flex flex-col">
                <DialogTitle className="flex items-end gap-3">u/{ban.banned.username} Ban</DialogTitle>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-bold">Reason</h1>
                        <p className="bg-[#222]/50 px-2 py-1 font-mono rounded wrap-break-word max-w-full whitespace-pre-wrap">{ban.reason || "No reason provided."}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h1 className="font-bold">Expires At</h1>
                        <p className="bg-[#222]/50 px-2 py-1 font-mono rounded wrap-break-word max-w-full whitespace-pre-wrap">{ban.expiresAt ? new Date(ban.expiresAt).toISOString() : "Permanently"}</p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={() => unban()}
                        className="mt-4 px-4 justify-center items-center flex disabled:opacity-50 disabled:hover:bg-orange-500 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                        Unban
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}