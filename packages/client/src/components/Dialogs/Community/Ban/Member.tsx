import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Community } from "@/types/community";
import type { User } from "@/types/user";
import { banMember } from "@/utils/api/members";
import { useState } from "react";
import toast from "react-hot-toast";

export function BanMember({ children, member, community }: { children: React.ReactNode, member: User, community: Community }) {
    const [form, setForm] = useState({
        reason: "",
        expiresAt: "30d"
    })
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [isOpen, setIsOpen] = useState(false);
    const ban = async () => {
        let duration;

        switch (form.expiresAt) {
            case "7d":
                duration = 7 * 24 * 60 * 60 * 1000;
                break;
            case "15d":
                duration = 15 * 24 * 60 * 60 * 1000;
                break;
            case "30d":
                duration = 30 * 24 * 60 * 60 * 1000;
                break;
            default:
                duration = null;
                break;
        }

        const date = duration ? new Date(Date.now() + duration) : null
        const ban = await banMember(community.name, member.id, form.reason, date)
        if (ban.status == 200) {
            toast.success(`${member.username} banned from c/${community.name}`);
            setIsOpen(false);
            setForm({ reason: "", expiresAt: "" })
        } else toast.error(ban?.data?.message)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>{children}</DialogTrigger>
            <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogTitle className="font-medium text-xl">Ban {member.username}</DialogTitle>
                <div className="w-full flex justify-center items-center">
                    <img src="https://media1.tenor.com/m/8w89YVypr1AAAAAC/elmo-fire.gif" className="max-w-sm rounded-lg" />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="font-bold">Reason</label>
                    {errors.reason && <p className="text-red-400">{errors.reason[0]}</p>}
                    <div className="flex focus-within:ring-2 rounded-lg focus-within:ring-orange-400/50 transition">
                        <input
                            value={form.reason}
                            max={64}
                            onChange={(e) => {
                                setErrors({})
                                setForm({ ...form, reason: e.target.value });
                            }}
                            placeholder="Reason"
                            className="px-4 py-3 rounded-lg w-full bg-[#444] border-b-3 border-[#242323] text-white focus:outline-none transition"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="font-bold">Duration</label>
                    {errors.expiresAt && <p className="text-red-400">{errors.expiresAt[0]}</p>}
                    <Select value={String(form.expiresAt)} onValueChange={(v) => setForm({ ...form, expiresAt: v })}>
                        <SelectTrigger className="w-full bg-[#444] py-6 border-none rounded-lg cursor-pointer">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#333] rounded-lg border-0">
                            <SelectItem value="7d">7 Days</SelectItem>
                            <SelectItem value="15d">15 Days</SelectItem>
                            <SelectItem value="30d">30 Days</SelectItem>
                            <SelectItem value="null">Permanently</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-full border-[#333] border-t justify-end flex">
                    <button
                        onClick={() => ban()}
                        className="mt-4 px-4 justify-center items-center flex disabled:opacity-50 disabled:hover:bg-orange-500 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                        BAN
                    </button>

                </div>
            </DialogContent>
        </Dialog>
    )
}