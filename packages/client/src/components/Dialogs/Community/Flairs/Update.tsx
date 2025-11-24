import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Flair } from "@/types/flair";
import { updateFlair } from "@/utils/api/flairs";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useParams } from "react-router-dom";

export function UpdateFlair({ children, flair }: { children: React.ReactNode, flair: Flair }) {
    const { name } = useParams();
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState({
        flair: flair.flair,
        color: flair.color,
        modOnly: String(flair.modOnly)
    })
    const [errors, setErrors] = useState<Record<string, string[]>>({})
    const colorInputRef = useRef<HTMLInputElement>(null)
    const qc = useQueryClient();
    const create = async () => {
        const r = await updateFlair(name!, flair.id, form.flair, form.color, form.modOnly == "true")
        if (r.status == 200) {
            setIsOpen(false);
            qc.setQueryData(["communities", name!, "flairs"], (old: Flair[]) =>
                old.map(f => f.id === flair.id ? r.data.data : f)
            )
        }
        else setErrors(r.data?.errors)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogTitle>Updating Flair</DialogTitle>

                <div className="flex flex-col gap-4">
                    <label className="font-bold">Flair</label>
                    {errors.flair && <p className="text-red-400">{errors.flair[0]}</p>}
                    <div className="flex focus-within:ring-2 rounded-lg focus-within:ring-orange-400/50 transition">
                        <input
                            value={form.flair}
                            max={32}
                            onChange={(e) => setForm({ ...form, flair: e.target.value })}
                            placeholder="Flair name"
                            className="px-4 py-3 rounded-lg w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <label className="font-bold">Color</label>
                    {errors.color && <p className="text-red-400">{errors.color[0]}</p>}
                    <div className="flex focus-within:ring-2 relative rounded-lg focus-within:ring-orange-400/50 transition" onClick={() => colorInputRef.current?.click()}>
                        <div className=" rounded-lg w-12 h-12">
                            <div className="h-full w-full rounded-l-lg" style={{ backgroundColor: form.color }} />
                        </div>
                        <input
                            value={form.color}
                            max={32}
                            placeholder="Flair Color"
                            className="px-4 py-3 rounded-lg rounded-l-none w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                        />
                        <input
                            type="color"
                            ref={colorInputRef}
                            value={form.color}
                            className="w-0 h-0 p-0 opacity-0 absolute pointer-events-none"
                            onChange={(e) => {
                                setErrors({})
                                setForm({ ...form, color: e.target.value });
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <label className="font-bold">Mod Only</label>
                        {errors.modOnly && <p className="text-red-400">{errors.modOnly[0]}</p>}
                        <Select value={form.modOnly} onValueChange={(v) => setForm({ ...form, modOnly: v })}>
                            <SelectTrigger className="w-full bg-[#313131] py-6 border-none rounded-lg cursor-pointer">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#333] rounded-lg border-0">
                                <SelectItem value="false">No</SelectItem>
                                <SelectItem value="true">Yes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full border-[#444] border-t justify-end flex">
                        <button
                            onClick={() => create()}
                            disabled={!form.flair.trim().length}
                            className="mt-4 px-4 justify-center items-center flex disabled:opacity-50 disabled:hover:bg-orange-500 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                            Create
                        </button>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}